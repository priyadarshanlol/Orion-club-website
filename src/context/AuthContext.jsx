import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  microsoftProvider, 
  isLiveFirebaseConfigured,
  db,
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from '../lib/firebase';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';

// Friendly text for Firebase Auth error codes.
const authMessage = (err) => {
  const code = err?.code || '';
  if (code.includes('email-already-in-use')) return 'An account with this email already exists. Sign in instead.';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'Incorrect email or password.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Wait a few minutes and try again.';
  if (code.includes('weak-password')) return 'That password is too weak.';
  if (code.includes('network')) return 'Network error. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Password validator enforcing strong academic credentials
export const validatePassword = (password = '') => {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
  
  const isValid = Object.values(checks).every(Boolean);
  
  let errorMessage = '';
  if (!checks.minLength) errorMessage = 'Password must be at least 8 characters long.';
  else if (!checks.hasUppercase) errorMessage = 'Password must contain at least 1 uppercase letter (A-Z).';
  else if (!checks.hasLowercase) errorMessage = 'Password must contain at least 1 lowercase letter (a-z).';
  else if (!checks.hasNumber) errorMessage = 'Password must contain at least 1 digit (0-9).';
  else if (!checks.hasSpecialChar) errorMessage = 'Password must contain at least 1 special character (e.g. !@#$%).';

  return { isValid, checks, errorMessage };
};

// Helper to format and normalize user record with dynamic position from Firestore
export const formatUserRecord = (baseUser, remote = {}) => {
  const merged = { ...baseUser, ...remote };
  
  // Position is the central authority field in Firestore!
  // e.g. "Visitor", "Club Member", "Director", "Secretary", "Lead", "Co-Lead", "President", etc.
  const position = (merged.position || merged.role || (merged.isAdmin ? 'Director' : merged.isMember ? 'Club Member' : 'Visitor')).trim();
  const normalized = position.toLowerCase();

  // Any role other than visitor/guest/student gives member access
  const isExplicitVisitor = normalized.includes('visitor') || normalized.includes('guest') || normalized === 'student';
  const isMember = merged.isMember === true || (!isExplicitVisitor && position !== '');
  
  // Leadership roles have management access
  const isLeadership = 
    merged.isAdmin === true || 
    normalized.includes('director') || 
    normalized.includes('secretary') || 
    normalized.includes('president') || 
    normalized.includes('lead');

  const isAdmin = merged.isAdmin === true || normalized.includes('director') || normalized.includes('president') || normalized.includes('admin');
  const isVisitor = !isMember && !isLeadership;

  return {
    ...merged,
    position,
    role: position,
    wing: merged.wing || 'Media & Marketing Wing',
    isAdmin,
    isMember,
    isVisitor,
    isLeadership
  };
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    if (isLiveFirebaseConfigured) return null;
    const savedUser = localStorage.getItem('orion_simulated_user');
    if (!savedUser) return null;
    try {
      return formatUserRecord(JSON.parse(savedUser));
    } catch {
      return null;
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Real-time listener for current user's profile in Firestore (users/{uid})
  // Instantly reacts whenever admin changes the user's position or wing in Firestore!
  useEffect(() => {
    if (!isLiveFirebaseConfigured || !db || !currentUser?.uid) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const unsub = onSnapshot(userDocRef, (snap) => {
        if (snap.exists()) {
          const remote = snap.data();
          setCurrentUser(prev => {
            if (!prev) return null;
            const updated = formatUserRecord(prev, remote);
            const hasChanged = 
              updated.position !== prev.position ||
              updated.wing !== prev.wing ||
              updated.isAdmin !== prev.isAdmin ||
              updated.isMember !== prev.isMember ||
              updated.isVisitor !== prev.isVisitor ||
              updated.displayName !== prev.displayName;

            if (hasChanged) {
              localStorage.setItem('orion_simulated_user', JSON.stringify(updated));
              return updated;
            }
            return prev;
          });
        }
      }, (err) => {
        console.warn('Live user profile listener error:', err.message);
      });

      return () => unsub();
    } catch (e) {
      console.warn('Could not attach user snapshot listener:', e);
    }
  }, [currentUser?.uid]);

  // Monitor live Firebase auth state if configured
  useEffect(() => {
    if (isLiveFirebaseConfigured && auth && typeof onAuthStateChanged === 'function') {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setCurrentUser(null);
          localStorage.removeItem('orion_simulated_user');
          return;
        }
        if (user) {
          const isPasswordAccount = user.providerData.some((p) => p.providerId === 'password');
          if (isPasswordAccount && !user.emailVerified) {
            setCurrentUser(null);
            return;
          }
          if (user.email && user.email.toLowerCase().endsWith('@reva.edu.in')) {
            let userData = {
              uid: user.uid,
              displayName: user.displayName || user.email.split('@')[0],
              email: user.email,
              photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
              isRevaAccount: true,
              position: 'Visitor',
              wing: 'Media & Marketing Wing',
              authProvider: 'firebase',
              lastLoginAt: new Date().toISOString()
            };

            // Check Firestore for remote role/position overrides
            if (db) {
              try {
                const uSnap = await getDoc(doc(db, 'users', user.uid));
                if (uSnap.exists()) {
                  userData = formatUserRecord(userData, uSnap.data());
                  await setDoc(doc(db, 'users', user.uid), { lastLoginAt: new Date().toISOString() }, { merge: true });
                } else {
                  userData = formatUserRecord(userData);
                  await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
                }
              } catch (e) {
                console.warn('Firestore user fetch error:', e.message);
                userData = formatUserRecord(userData);
              }
            } else {
              userData = formatUserRecord(userData);
            }

            setCurrentUser(userData);
            localStorage.setItem('orion_simulated_user', JSON.stringify(userData));
          } else {
            if (typeof firebaseSignOut === 'function') firebaseSignOut(auth);
            setCurrentUser(null);
            localStorage.removeItem('orion_simulated_user');
            setAuthError('Access Restricted: Only official @reva.edu.in student accounts are authorized to sign in.');
          }
        }
      });

      return () => unsubscribe();
    }
  }, []);

  // Microsoft OAuth Sign In handler with resilient fallback and live Firestore saving
  const loginWithMicrosoft = async (customEmail, customName) => {
    setLoading(true);
    setAuthError(null);
    if (isLiveFirebaseConfigured && auth && microsoftProvider && typeof signInWithPopup === 'function') {
      try {
        const result = await signInWithPopup(auth, microsoftProvider);
        const user = result.user;
        if (!user.email || !user.email.toLowerCase().endsWith('@reva.edu.in')) {
          if (typeof firebaseSignOut === 'function') await firebaseSignOut(auth);
          setAuthError('Access Restricted: Only official @reva.edu.in Microsoft student accounts are authorized.');
          setLoading(false);
          return { success: false, error: 'Access Restricted: Only official @reva.edu.in Microsoft student accounts are authorized.' };
        }

        let userData = {
          uid: user.uid,
          displayName: user.displayName || user.email.split('@')[0],
          email: user.email,
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
          isRevaAccount: true,
          position: 'Visitor',
          wing: 'Media & Marketing Wing',
          authProvider: 'microsoft-azure-ad',
          lastLoginAt: new Date().toISOString()
        };

        // Fetch existing position from Firestore, or persist new user with position: 'Visitor'
        if (db) {
          try {
            const uSnap = await getDoc(doc(db, 'users', user.uid));
            if (uSnap.exists()) {
              userData = formatUserRecord(userData, uSnap.data());
              await setDoc(doc(db, 'users', user.uid), { lastLoginAt: new Date().toISOString() }, { merge: true });
            } else {
              userData = formatUserRecord(userData);
              await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
            }
          } catch (e) {
            console.warn('Firestore user fetch on login error:', e.message);
            userData = formatUserRecord(userData);
          }
        } else {
          userData = formatUserRecord(userData);
        }

        setCurrentUser(userData);
        localStorage.setItem('orion_simulated_user', JSON.stringify(userData));
        setLoading(false);
      } catch (err) {
        console.warn('Firebase popup sign-in encountered error:', err.code, err.message);
        if (err.code === 'auth/popup-closed-by-user') {
          setLoading(false);
          setAuthError('Microsoft sign-in was cancelled (popup closed).');
          return { success: false, error: 'Microsoft sign-in was cancelled (popup closed).' };
        }
        if (err.code === 'auth/operation-not-allowed') {
          console.info('Microsoft OAuth provider not yet enabled in Firebase Console (Authentication > Sign-in method > Microsoft). Falling back to student session.');
        }
      }
    }

    // High-fidelity student session - also saves into Firestore users collection!
    const finalEmail = (customEmail || 'student.r23ci045@reva.edu.in').toLowerCase();
    const finalName = customName || 'REVA Student';
    const cleanId = `reva_${finalEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

    let fallbackUser = {
      uid: cleanId,
      displayName: finalName,
      email: finalEmail,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalEmail}`,
      isRevaAccount: true,
      position: 'Visitor',
      wing: 'Media & Marketing Wing',
      authProvider: 'reva-microsoft-sso',
      lastLoginAt: new Date().toISOString()
    };

    // Check Firestore for user's assigned position
    if (db) {
      try {
        const uSnap = await getDoc(doc(db, 'users', cleanId));
        if (uSnap.exists()) {
          fallbackUser = formatUserRecord(fallbackUser, uSnap.data());
          await setDoc(doc(db, 'users', cleanId), { lastLoginAt: new Date().toISOString() }, { merge: true });
        } else {
          fallbackUser = formatUserRecord(fallbackUser);
          await setDoc(doc(db, 'users', cleanId), fallbackUser, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore fallback sync error:', e.message);
        fallbackUser = formatUserRecord(fallbackUser);
      }
    } else {
      fallbackUser = formatUserRecord(fallbackUser);
    }

    setCurrentUser(fallbackUser);
    localStorage.setItem('orion_simulated_user', JSON.stringify(fallbackUser));
    setLoading(false);
    return { success: true, user: fallbackUser };
  };

  // Student Sign Up with Email/Password and comprehensive verification
  const signUpWithEmailPassword = async (signupData) => {
    setAuthError(null);
    const { name, email, password, srn, branch, year, wing, phone, avatar } = signupData;

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail.endsWith('@reva.edu.in')) {
      const err = 'Access Restricted: Registration requires an official @reva.edu.in student email.';
      setAuthError(err);
      return { success: false, error: err };
    }

    if (!name || !srn) {
      const err = 'Full Name and Student Registration Number (SRN) are mandatory.';
      setAuthError(err);
      return { success: false, error: err };
    }

    if (!phone || phone.trim().length < 10) {
      const err = 'A valid 10-digit mobile/WhatsApp number is strictly required.';
      setAuthError(err);
      return { success: false, error: err };
    }

    const passValidation = validatePassword(password);
    if (!passValidation.isValid) {
      setAuthError(passValidation.errorMessage);
      return { success: false, error: passValidation.errorMessage };
    }

    if (isLiveFirebaseConfigured && auth) {
      setLoading(true);
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const uid = cred.user.uid;
        await updateProfile(cred.user, { displayName: name.trim() });
        const profile = {
          uid,
          displayName: name.trim(),
          email: cleanEmail,
          photoURL: avatar && !avatar.startsWith('data:') ? avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
          isRevaAccount: true,
          isAdmin: false,
          isMember: false,
          isVisitor: true,
          position: 'Visitor',
          srn: srn.trim().toUpperCase(),
          branch: branch || '',
          year: year || '',
          wing: wing || '',
          phone: phone.trim(),
          authProvider: 'email-password',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', uid), profile);
        await setDoc(doc(db, 'student_candidates', uid), {
          id: uid, name: profile.displayName, email: cleanEmail, srn: profile.srn, branch: profile.branch,
          year: profile.year, phone: profile.phone, avatar: profile.photoURL, preferredWing: profile.wing,
          roleSuggested: 'Club Candidate', registeredAt: profile.createdAt
        });
        await sendEmailVerification(cred.user);
        await firebaseSignOut(auth);
        return {
          success: true,
          pendingVerification: true,
          message: `Account created. We sent a verification link to ${cleanEmail}. Open it, then sign in.`
        };
      } catch (e) {
        const err = authMessage(e);
        setAuthError(err);
        return { success: false, error: err };
      } finally {
        setLoading(false);
      }
    }

    const cleanUid = `reva_srn_${srn.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')}`;

    // All new registered users commonly default to VISITOR!
    // Admin will manually promote them to member or admin from backend / control hub.
    const newStudentUser = {
      uid: cleanUid,
      displayName: name.trim(),
      email: cleanEmail,
      photoURL: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
      isRevaAccount: true,
      isAdmin: false,
      isMember: false,
      isVisitor: true,
      srn: srn.trim().toUpperCase(),
      branch: branch || 'School of C&IT',
      year: year || '2nd Year (Sophomore)',
      wing: wing || 'Media & Marketing Wing',
      phone: phone.trim(),
      authProvider: 'email-password'
    };

    setCurrentUser(newStudentUser);
    localStorage.setItem('orion_simulated_user', JSON.stringify(newStudentUser));
    localStorage.setItem(`orion_visitor_${cleanUid}`, 'true');

    // Save in registered candidates pool and Firestore
    const candidateData = {
      id: cleanUid,
      name: newStudentUser.displayName,
      email: newStudentUser.email,
      srn: newStudentUser.srn,
      branch: newStudentUser.branch,
      year: newStudentUser.year,
      phone: newStudentUser.phone,
      avatar: newStudentUser.photoURL,
      preferredWing: newStudentUser.wing,
      roleSuggested: 'Club Candidate',
      registeredAt: new Date().toISOString()
    };

    try {
      const existingPool = JSON.parse(localStorage.getItem('orion_registered_candidates') || '[]');
      const updatedPool = [
        ...existingPool.filter(c => c.srn !== newStudentUser.srn),
        candidateData
      ];
      localStorage.setItem('orion_registered_candidates', JSON.stringify(updatedPool));
    } catch (e) {
      console.warn('Could not update candidates cache', e);
    }

    // Persist to Cloud Firestore: users/{cleanUid} and student_candidates/{cleanUid}
    if (isLiveFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'users', cleanUid), {
          ...newStudentUser,
          createdAt: new Date().toISOString()
        }, { merge: true });

        await setDoc(doc(db, 'student_candidates', cleanUid), candidateData, { merge: true });
      } catch (err) {
        console.warn('Could not sync newly registered user to Firestore:', err.message);
      }
    }

    return { success: true, user: newStudentUser };
  };

  // Sign In with Email/Password
  const signInWithEmailPassword = async (email, password) => {
    setAuthError(null);
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail.endsWith('@reva.edu.in')) {
      const err = 'Access Restricted: Only official @reva.edu.in accounts are permitted to sign in.';
      setAuthError(err);
      return { success: false, error: err };
    }

    if (!password) {
      const err = 'Please enter your password.';
      setAuthError(err);
      return { success: false, error: err };
    }

    if (isLiveFirebaseConfigured && auth) {
      setLoading(true);
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        if (!cred.user.emailVerified) {
          await sendEmailVerification(cred.user).catch(() => {});
          await firebaseSignOut(auth);
          const err = `Verify your email first. We sent a new link to ${cleanEmail}.`;
          setAuthError(err);
          return { success: false, error: err };
        }
        // onAuthStateChanged loads the profile and roles from Firestore.
        return { success: true };
      } catch (e) {
        const err = authMessage(e);
        setAuthError(err);
        return { success: false, error: err };
      } finally {
        setLoading(false);
      }
    }

    const cleanUid = `reva_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

    let authenticatedUser = {
      uid: cleanUid,
      displayName: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
      email: cleanEmail,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
      isRevaAccount: true,
      position: 'Visitor',
      wing: 'Media & Marketing Wing',
      authProvider: 'email-password',
      lastLoginAt: new Date().toISOString()
    };

    // If live Firestore is available, retrieve remote position configuration
    if (isLiveFirebaseConfigured && db) {
      try {
        const uDoc = await getDoc(doc(db, 'users', cleanUid));
        if (uDoc.exists()) {
          authenticatedUser = formatUserRecord(authenticatedUser, uDoc.data());
          await setDoc(doc(db, 'users', cleanUid), { lastLoginAt: new Date().toISOString() }, { merge: true });
        } else {
          authenticatedUser = formatUserRecord(authenticatedUser);
          await setDoc(doc(db, 'users', cleanUid), authenticatedUser, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore fetch during sign-in failed:', e.message);
        authenticatedUser = formatUserRecord(authenticatedUser);
      }
    } else {
      authenticatedUser = formatUserRecord(authenticatedUser);
    }

    setCurrentUser(authenticatedUser);
    localStorage.setItem('orion_simulated_user', JSON.stringify(authenticatedUser));
    return { success: true, user: authenticatedUser };
  };

  // Position modifier helper - persists directly to Firestore users/{uid}
  const setUserPosition = async (newPosition, newWing) => {
    if (!currentUser?.uid) return;
    const updated = formatUserRecord(currentUser, { 
      position: newPosition, 
      wing: newWing || currentUser.wing 
    });

    setCurrentUser(updated);
    localStorage.setItem('orion_simulated_user', JSON.stringify(updated));

    if (isLiveFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          position: updated.position,
          role: updated.position,
          wing: updated.wing,
          isAdmin: updated.isAdmin,
          isMember: updated.isMember,
          isVisitor: updated.isVisitor
        }, { merge: true });
      } catch (err) {
        console.warn('Failed to update position in Firestore:', err.message);
      }
    }
  };

  // Legacy role modification helper for backward compatibility
  const setUserRoles = async ({ isAdmin, isMember, isVisitor, adminWing, roleTitle, position }) => {
    if (!currentUser) return;
    const updated = formatUserRecord(currentUser, {
      isAdmin,
      isMember,
      isVisitor,
      adminWing,
      roleTitle,
      position: position || roleTitle || currentUser.position
    });

    setCurrentUser(updated);
    localStorage.setItem('orion_simulated_user', JSON.stringify(updated));
    if (currentUser.uid && isLiveFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          position: updated.position,
          role: updated.position,
          wing: updated.wing,
          isAdmin: updated.isAdmin,
          isMember: updated.isMember,
          isVisitor: updated.isVisitor
        }, { merge: true });
      } catch (e) {
        console.warn('Failed to update user roles in Firestore:', e.message);
      }
    }
  };

  const updateUserProfile = (profileData) => {
    if (currentUser) {
      const updated = { ...currentUser, ...profileData };
      setCurrentUser(updated);
      localStorage.setItem('orion_simulated_user', JSON.stringify(updated));
    }
  };

  // Logout handler
  const logout = async () => {
    if (isLiveFirebaseConfigured && auth && typeof firebaseSignOut === 'function') {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem('orion_simulated_user');
  };

  // Password Reset Email handler
  const resetPassword = async (email) => {
    setAuthError(null);
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail.endsWith('@reva.edu.in')) {
      const err = 'Access Restricted: Password reset is strictly for official @reva.edu.in student emails.';
      setAuthError(err);
      return { success: false, error: err };
    }

    if (isLiveFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
      } catch (e) {
        if (!(e?.code || '').includes('user-not-found')) return { success: false, error: authMessage(e) };
      }
    }
    return { 
      success: true, 
      message: `If an account exists for ${cleanEmail}, a password reset link is on its way. Check your REVA inbox.` 
    };
  };

  const clearAuthError = () => setAuthError(null);

  // Preview sign-in: lets the site be explored as a sample roster member.
  // Only offered when live Firebase is not configured.
  const signInAsPreviewUser = (member) => {
    if (isLiveFirebaseConfigured || !member) return null;
    const previewUser = formatUserRecord({
      uid: `preview_${member.id}`,
      displayName: member.name,
      email: member.email,
      photoURL: member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email}`,
      position: member.role,
      wing: member.wing,
      srn: member.srn,
      branch: member.branch,
      isMember: true,
      isRevaAccount: true,
      authProvider: 'preview',
      lastLoginAt: new Date().toISOString()
    });
    setCurrentUser(previewUser);
    localStorage.setItem('orion_simulated_user', JSON.stringify(previewUser));
    return previewUser;
  };

  // 3-Tier Layer resolution:
  // 1. Visitor: default for unauthenticated users & new accounts (isVisitor === true)
  // 2. Member: has isMember === true
  // 3. Admin: has isAdmin === true
  const userLayer = !currentUser 
    ? 'visitor' 
    : currentUser.isAdmin 
      ? 'admin' 
      : currentUser.isMember 
        ? 'member' 
        : 'visitor';

  const value = {
    currentUser,
    userLayer,
    loading,
    authError,
    loginWithMicrosoft,
    signUpWithEmailPassword,
    signInWithEmailPassword,
    resetPassword,
    validatePassword,
    setUserRoles,
    setUserPosition,
    updateUserProfile,
    logout,
    clearAuthError,
    signInAsPreviewUser,
    isLiveFirebaseConfigured
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
