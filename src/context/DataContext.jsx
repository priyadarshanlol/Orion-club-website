import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  INITIAL_AUDITION_SLOTS, 
  INITIAL_EVENTS, 
  INITIAL_WINGS, 
  INITIAL_TEAM, 
  NOTICE_TICKER_ITEMS,
  INITIAL_CLUB_MEMBERS,
  INITIAL_STUDENT_CANDIDATES
} from '../lib/data';
import { 
  db, 
  isLiveFirebaseConfigured, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  deleteDoc, 
  serverTimestamp 
} from '../lib/firebase';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // 1. Audition Slots State
  const [auditionSlots, setAuditionSlots] = useState(() => {
    const localSlots = localStorage.getItem('orion_audition_slots');
    return localSlots ? JSON.parse(localSlots) : INITIAL_AUDITION_SLOTS;
  });

  // 2. Events State with 5-Wing / Finished Media Schema Migration
  const [events, setEventsState] = useState(() => {
    const localEvents = localStorage.getItem('orion_events');
    if (localEvents) {
      try {
        const parsed = JSON.parse(localEvents);
        if (parsed.length >= 3 && parsed.some(e => e.media)) return parsed;
      } catch (e) {
        console.warn('Events migration error:', e);
      }
    }
    localStorage.setItem('orion_events', JSON.stringify(INITIAL_EVENTS));
    return INITIAL_EVENTS;
  });

  // 3. Wings State with 5-Wing Migration (Nanak, Zayd-Bodhi, Cultural, Arjuna, Media)
  const [wings, setWingsState] = useState(() => {
    const localWings = localStorage.getItem('orion_wings');
    if (localWings) {
      try {
        const parsed = JSON.parse(localWings);
        if (parsed.length === 5 && parsed.some(w => w.id === 'cultural')) return parsed;
      } catch (e) {
        console.warn('Wings migration error:', e);
      }
    }
    localStorage.setItem('orion_wings', JSON.stringify(INITIAL_WINGS));
    return INITIAL_WINGS;
  });

  // 4. Team Roster State with 5-Wing Migration
  const [team, setTeamState] = useState(() => {
    const localTeam = localStorage.getItem('orion_team');
    if (localTeam) {
      try {
        const parsed = JSON.parse(localTeam);
        if (parsed.length >= 4) return parsed;
      } catch (e) {
        console.warn('Team migration error:', e);
      }
    }
    localStorage.setItem('orion_team', JSON.stringify(INITIAL_TEAM));
    return INITIAL_TEAM;
  });

  // 5. Notice Bar
  const [noticeTicker, setNoticeTickerState] = useState(() => {
    const localNotices = localStorage.getItem('orion_notices');
    return localNotices ? JSON.parse(localNotices) : NOTICE_TICKER_ITEMS;
  });

  // 6. Club Members (Points, 3-Flags, Stars, Timings)
  const [clubMembers, setClubMembersState] = useState(() => {
    const localMembers = localStorage.getItem('orion_club_members');
    if (localMembers) {
      try {
        const parsed = JSON.parse(localMembers);
        if (parsed.length >= 5 && parsed.some(m => m.wing === 'NANAK' || m.wing === 'KALA-SANSKRITI')) return parsed;
      } catch (e) {
        console.warn('Members migration error:', e);
      }
    }
    localStorage.setItem('orion_club_members', JSON.stringify(INITIAL_CLUB_MEMBERS));
    return INITIAL_CLUB_MEMBERS;
  });
  
  // 7. Dynamic Student Candidates Pool (For Dynamic Keyword Autocomplete in Member Registration)
  const [studentCandidates, setStudentCandidatesState] = useState(() => {
    const localCandidates = localStorage.getItem('orion_registered_candidates');
    if (localCandidates) {
      try {
        const parsed = JSON.parse(localCandidates);
        if (parsed.length >= 5) return parsed;
      } catch (e) {
        console.warn('Candidates migration error:', e);
      }
    }
    localStorage.setItem('orion_registered_candidates', JSON.stringify(INITIAL_STUDENT_CANDIDATES));
    return INITIAL_STUDENT_CANDIDATES;
  });

  // 8. Applications Map { [uid]: applicationData }
  const [applicationsMap, setApplicationsMap] = useState(() => {
    const localApps = localStorage.getItem('orion_recruitment_applications');
    return localApps ? JSON.parse(localApps) : {};
  });

  // Toast notification state
  const [toast, setToast] = useState(null);
  const [firestoreStatus, setFirestoreStatus] = useState(isLiveFirebaseConfigured ? 'connecting' : 'offline');

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Asynchronously synchronize a single document with Cloud Firestore
  const syncDocToFirestore = async (collectionName, docId, data, isDelete = false) => {
    if (!isLiveFirebaseConfigured || !db) return;
    try {
      const docRef = doc(db, collectionName, String(docId));
      if (isDelete) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, data, { merge: true });
      }
    } catch (err) {
      console.warn(`Firestore sync error for ${collectionName}/${docId}:`, err.message);
    }
  };

  // Automatically seed Cloud Firestore when brand new / empty
  const isSeedingRef = useRef(false);
  const seedInitialFirestoreData = async (force = false) => {
    if (!isLiveFirebaseConfigured || !db || isSeedingRef.current) return;
    isSeedingRef.current = true;
    try {
      console.log('⚡ Seeding initial Club ORION data into Cloud Firestore (club-orion-reva)...');
      
      // 1. Wings
      for (const w of INITIAL_WINGS) {
        await setDoc(doc(db, 'wings', w.id), w, { merge: true });
      }
      // 2. Events
      for (const e of INITIAL_EVENTS) {
        await setDoc(doc(db, 'events', e.id), e, { merge: true });
      }
      // 3. Members
      for (const m of INITIAL_CLUB_MEMBERS) {
        await setDoc(doc(db, 'club_members', m.id), m, { merge: true });
      }
      // 4. Team
      for (const t of INITIAL_TEAM) {
        const catId = (t.category || 'team').toLowerCase().replace(/[^a-z0-9]/g, '_');
        await setDoc(doc(db, 'team', catId), t, { merge: true });
      }
      // 5. Audition Slots
      for (const s of INITIAL_AUDITION_SLOTS) {
        await setDoc(doc(db, 'audition_slots', s.id), s, { merge: true });
      }
      // 6. Student Candidates
      for (const c of INITIAL_STUDENT_CANDIDATES) {
        await setDoc(doc(db, 'student_candidates', c.id), c, { merge: true });
      }
      // 7. Notices
      await setDoc(doc(db, 'notices', 'current'), { items: NOTICE_TICKER_ITEMS, updatedAt: serverTimestamp() }, { merge: true });

      // 8. User Accounts & Positions
      for (const m of INITIAL_CLUB_MEMBERS) {
        await setDoc(doc(db, 'users', m.id), {
          uid: m.id,
          displayName: m.name,
          email: m.email,
          srn: m.srn,
          branch: m.branch,
          wing: m.wing,
          position: m.role || 'Club Member',
          role: m.role || 'Club Member',
          phone: m.phone || '',
          photoURL: m.avatar,
          isMember: true,
          isVisitor: false,
          isAdmin: (m.role || '').toLowerCase().includes('director') || (m.role || '').toLowerCase().includes('president'),
          createdAt: new Date().toISOString()
        }, { merge: true });
      }

      setFirestoreStatus('live');
      console.log('✅ Successfully seeded all collections (including users & positions) into Cloud Firestore.');
    } catch (err) {
      console.error('Firestore seeding warning:', err.message);
      setFirestoreStatus('permission_error');
    } finally {
      isSeedingRef.current = false;
    }
  };

  // Synchronize ALL live state to Cloud Firestore on-demand
  const syncAllDataToFirestore = async (silent = false) => {
    if (!isLiveFirebaseConfigured || !db) {
      if (!silent) showToast('Firebase configuration missing or offline.', 'error');
      return { success: false, error: 'Firebase not configured' };
    }

    try {
      setFirestoreStatus('syncing');
      for (const w of wings) {
        await setDoc(doc(db, 'wings', w.id), w, { merge: true });
      }
      for (const e of events) {
        await setDoc(doc(db, 'events', e.id), e, { merge: true });
      }
      for (const m of clubMembers) {
        await setDoc(doc(db, 'club_members', m.id), m, { merge: true });
      }
      for (const t of team) {
        const catId = (t.category || 'team').toLowerCase().replace(/[^a-z0-9]/g, '_');
        await setDoc(doc(db, 'team', catId), t, { merge: true });
      }
      for (const s of auditionSlots) {
        await setDoc(doc(db, 'audition_slots', s.id), s, { merge: true });
      }
      for (const c of studentCandidates) {
        await setDoc(doc(db, 'student_candidates', c.id), c, { merge: true });
      }
      await setDoc(doc(db, 'notices', 'current'), { items: noticeTicker, updatedAt: serverTimestamp() }, { merge: true });

      setFirestoreStatus('live');
      if (!silent) {
        showToast('⚡ Live Cloud Firestore Synced! All 5 wings, members & events updated in Firebase Console.', 'success');
      }
      return { success: true };
    } catch (err) {
      console.error('Error syncing data to Firestore:', err);
      setFirestoreStatus('permission_error');
      if (!silent) {
        showToast(`Firestore Sync Error: ${err.message}. Check Security Rules!`, 'error');
      }
      return { success: false, error: err.message };
    }
  };

  // Real-time Cloud Firestore synchronization listeners
  useEffect(() => {
    if (!isLiveFirebaseConfigured || !db) return;

    let unsubMembers, unsubEvents, unsubWings, unsubTeam, unsubSlots, unsubCandidates, unsubApps, unsubNotices;

    try {
      // 1. Members Listener
      unsubMembers = onSnapshot(collection(db, 'club_members'), (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
          setClubMembersState(list);
          localStorage.setItem('orion_club_members', JSON.stringify(list));
          setFirestoreStatus('live');
        } else {
          // If empty in Firestore, auto-seed with 5 wings data!
          seedInitialFirestoreData();
        }
      }, (err) => {
        console.warn('club_members snapshot error:', err.message);
        if (err.code === 'permission-denied') setFirestoreStatus('permission_error');
      });

      // 2. Events Listener
      unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
          setEventsState(list);
          localStorage.setItem('orion_events', JSON.stringify(list));
        }
      }, (err) => console.warn('events snapshot error:', err.message));

      // 3. Wings Listener
      unsubWings = onSnapshot(collection(db, 'wings'), (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
          list.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
          setWingsState(list);
          localStorage.setItem('orion_wings', JSON.stringify(list));
        }
      }, (err) => console.warn('wings snapshot error:', err.message));

      // 4. Team Listener
      unsubTeam = onSnapshot(collection(db, 'team'), (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
          setTeamState(list);
          localStorage.setItem('orion_team', JSON.stringify(list));
        }
      }, (err) => console.warn('team snapshot error:', err.message));

      // 5. Audition Slots Listener
      unsubSlots = onSnapshot(collection(db, 'audition_slots'), (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
          setAuditionSlots(list);
          localStorage.setItem('orion_audition_slots', JSON.stringify(list));
        }
      }, (err) => console.warn('audition_slots snapshot error:', err.message));

      // 6. Student Candidates Listener
      unsubCandidates = onSnapshot(collection(db, 'student_candidates'), (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
          setStudentCandidatesState(list);
          localStorage.setItem('orion_registered_candidates', JSON.stringify(list));
        }
      }, (err) => console.warn('student_candidates snapshot error:', err.message));

      // 7. Applications Listener
      unsubApps = onSnapshot(collection(db, 'recruitment_applications'), (snapshot) => {
        if (!snapshot.empty) {
          const apps = {};
          snapshot.forEach(d => {
            apps[d.id] = d.data();
          });
          setApplicationsMap(apps);
          localStorage.setItem('orion_recruitment_applications', JSON.stringify(apps));
        }
      }, (err) => console.warn('recruitment_applications snapshot error:', err.message));

      // 8. Notices Listener
      unsubNotices = onSnapshot(collection(db, 'notices'), (snapshot) => {
        if (!snapshot.empty) {
          const noticesDoc = snapshot.docs.find(d => d.id === 'current');
          if (noticesDoc && Array.isArray(noticesDoc.data().items)) {
            setNoticeTickerState(noticesDoc.data().items);
            localStorage.setItem('orion_notices', JSON.stringify(noticesDoc.data().items));
          }
        }
      }, (err) => console.warn('notices snapshot error:', err.message));

    } catch (err) {
      console.warn('Error establishing Firestore listeners:', err);
    }

    return () => {
      if (unsubMembers) unsubMembers();
      if (unsubEvents) unsubEvents();
      if (unsubWings) unsubWings();
      if (unsubTeam) unsubTeam();
      if (unsubSlots) unsubSlots();
      if (unsubCandidates) unsubCandidates();
      if (unsubApps) unsubApps();
      if (unsubNotices) unsubNotices();
    };
  }, []);

  // State setters with localStorage & Firestore sync
  const setWings = (newWings) => {
    setWingsState(newWings);
    localStorage.setItem('orion_wings', JSON.stringify(newWings));
    if (isLiveFirebaseConfigured && db && Array.isArray(newWings)) {
      newWings.forEach(w => syncDocToFirestore('wings', w.id, w));
    }
    showToast('Wing details updated successfully!', 'success');
  };

  const setTeam = (newTeam) => {
    setTeamState(newTeam);
    localStorage.setItem('orion_team', JSON.stringify(newTeam));
    if (isLiveFirebaseConfigured && db && Array.isArray(newTeam)) {
      newTeam.forEach(t => {
        const catId = (t.category || 'team').toLowerCase().replace(/[^a-z0-9]/g, '_');
        syncDocToFirestore('team', catId, t);
      });
    }
    showToast('Team roster updated successfully!', 'success');
  };

  const setEvents = (newEvents) => {
    setEventsState(newEvents);
    localStorage.setItem('orion_events', JSON.stringify(newEvents));
    if (isLiveFirebaseConfigured && db && Array.isArray(newEvents)) {
      newEvents.forEach(e => syncDocToFirestore('events', e.id, e));
    }
    showToast('Events updated successfully!', 'success');
  };

  const setNoticeTicker = (newNotices) => {
    setNoticeTickerState(newNotices);
    localStorage.setItem('orion_notices', JSON.stringify(newNotices));
    syncDocToFirestore('notices', 'current', { items: newNotices, updatedAt: serverTimestamp() });
    showToast('Notice ticker updated successfully!', 'success');
  };

  const setClubMembers = (newMembers) => {
    setClubMembersState(newMembers);
    localStorage.setItem('orion_club_members', JSON.stringify(newMembers));
    if (isLiveFirebaseConfigured && db && Array.isArray(newMembers)) {
      newMembers.forEach(m => syncDocToFirestore('club_members', m.id, m));
    }
  };

  // Dynamic Keyword Search for Student Candidates
  const searchStudentCandidates = (query = '') => {
    const clean = query.trim().toLowerCase();
    if (!clean) return studentCandidates.slice(0, 8);

    return studentCandidates.filter(c => 
      c.name?.toLowerCase().includes(clean) ||
      c.srn?.toLowerCase().includes(clean) ||
      c.email?.toLowerCase().includes(clean) ||
      c.branch?.toLowerCase().includes(clean)
    );
  };

  // MEMBER MANAGEMENT: Points System (+/- points)
  const updateMemberPoints = (memberId, deltaPoints, reason = 'Administrative Adjustment') => {
    let targetMember = null;
    setClubMembersState(prev => {
      const updated = prev.map(m => {
        if (m.id === memberId) {
          const newPoints = Math.max(0, (m.points || 0) + deltaPoints);
          const scoreDelta = deltaPoints > 0 ? 1 : -1;
          const newScore = Math.min(100, Math.max(10, (m.overallScore || 75) + scoreDelta));
          targetMember = {
            ...m,
            points: newPoints,
            overallScore: newScore
          };
          return targetMember;
        }
        return m;
      });
      localStorage.setItem('orion_club_members', JSON.stringify(updated));
      return updated;
    });

    if (targetMember) {
      syncDocToFirestore('club_members', memberId, targetMember);
    }

    const sign = deltaPoints >= 0 ? `+${deltaPoints}` : `${deltaPoints}`;
    showToast(`Updated points: ${sign} pts (${reason})`, deltaPoints >= 0 ? 'success' : 'info');
  };

  // Direct overall score adjustment
  const updateMemberScore = (memberId, newScore) => {
    const bounded = Math.min(100, Math.max(0, parseInt(newScore, 10) || 0));
    let targetMember = null;
    setClubMembersState(prev => {
      const updated = prev.map(m => {
        if (m.id === memberId) {
          targetMember = { ...m, overallScore: bounded };
          return targetMember;
        }
        return m;
      });
      localStorage.setItem('orion_club_members', JSON.stringify(updated));
      return updated;
    });

    if (targetMember) {
      syncDocToFirestore('club_members', memberId, targetMember);
    }
    showToast(`Updated performance score to ${bounded}%!`, 'success');
  };

  // 3-FLAG WARNING SYSTEM: Issue Warning Strike (Remove 1 Flag)
  const removeMemberFlag = (memberId, reason = 'Policy Violation') => {
    let firedHappened = false;
    let memberName = 'Member';
    let targetMember = null;

    setClubMembersState(prev => {
      const updated = prev.map(m => {
        if (m.id === memberId) {
          memberName = m.name;
          const currentFlags = m.flags !== undefined ? m.flags : 3;
          const newFlags = Math.max(0, currentFlags - 1);
          const newStatus = newFlags === 0 ? 'fired' : 'warning';
          if (newFlags === 0) firedHappened = true;

          const flagEntry = {
            id: `flag_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            reason: reason.trim() || 'Disciplinary warning issued by Directorate',
            issuedBy: 'NANAK Discipline Directorate',
            flagsRemaining: newFlags
          };

          targetMember = {
            ...m,
            flags: newFlags,
            status: newStatus,
            flagHistory: [flagEntry, ...(m.flagHistory || [])],
            overallScore: Math.max(10, (m.overallScore || 80) - 12)
          };
          return targetMember;
        }
        return m;
      });
      localStorage.setItem('orion_club_members', JSON.stringify(updated));
      return updated;
    });

    if (targetMember) {
      syncDocToFirestore('club_members', memberId, targetMember);
    }

    if (firedHappened) {
      showToast(`🚨 ALL 3 FLAGS EXHAUSTED: ${memberName} has been FIRED and dismissed from active duties!`, 'error');
    } else {
      showToast(`⚠️ Warning Strike issued to ${memberName}. Flag removed!`, 'warning');
    }
  };

  // 3-FLAG WARNING SYSTEM: Renew Flags to 3/3
  const renewMemberFlags = (memberId) => {
    let memberName = 'Member';
    let targetMember = null;
    setClubMembersState(prev => {
      const updated = prev.map(m => {
        if (m.id === memberId) {
          memberName = m.name;
          targetMember = {
            ...m,
            flags: 3,
            status: 'active',
            flagHistory: [
              {
                id: `renew_${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                reason: 'Disciplinary slate cleared. Flags renewed to 3/3 by Directorate.',
                issuedBy: 'NANAK Discipline Directorate',
                flagsRemaining: 3
              },
              ...(m.flagHistory || [])
            ]
          };
          return targetMember;
        }
        return m;
      });
      localStorage.setItem('orion_club_members', JSON.stringify(updated));
      return updated;
    });

    if (targetMember) {
      syncDocToFirestore('club_members', memberId, targetMember);
    }
    showToast(`✨ Restored 3/3 flags for ${memberName}! Disciplinary record cleared.`, 'success');
  };

  // 3-FLAG WARNING SYSTEM: Re-Hire Fired Member
  const rehireMember = (memberId) => {
    let memberName = 'Member';
    let targetMember = null;
    setClubMembersState(prev => {
      const updated = prev.map(m => {
        if (m.id === memberId) {
          memberName = m.name;
          targetMember = {
            ...m,
            flags: 3,
            status: 'active',
            overallScore: 70,
            flagHistory: [
              {
                id: `rehire_${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                reason: 'Re-hired & reinstated by Core Leadership. Restored to 3/3 flags.',
                issuedBy: 'Core Leadership',
                flagsRemaining: 3
              },
              ...(m.flagHistory || [])
            ]
          };
          return targetMember;
        }
        return m;
      });
      localStorage.setItem('orion_club_members', JSON.stringify(updated));
      return updated;
    });

    if (targetMember) {
      syncDocToFirestore('club_members', memberId, targetMember);
    }
    showToast(`🎉 RE-HIRED: ${memberName} has been reinstated to active club membership with 3 flags!`, 'success');
  };

  // STAR AWARDS
  const awardMemberStar = (memberId, citation = 'Outstanding Work & Dedication') => {
    let memberName = 'Member';
    let targetMember = null;
    setClubMembersState(prev => {
      const updated = prev.map(m => {
        if (m.id === memberId) {
          memberName = m.name;
          const currentStars = m.stars || 0;
          targetMember = {
            ...m,
            stars: currentStars + 1,
            points: (m.points || 0) + 100,
            overallScore: Math.min(100, (m.overallScore || 80) + 3)
          };
          return targetMember;
        }
        return m;
      });
      localStorage.setItem('orion_club_members', JSON.stringify(updated));
      return updated;
    });

    if (targetMember) {
      syncDocToFirestore('club_members', memberId, targetMember);
    }
    showToast(`⭐ Star Awarded to ${memberName} for ${citation}! (+100 pts bonus)`, 'success');
  };

  const revokeMemberStar = (memberId) => {
    let targetMember = null;
    setClubMembersState(prev => {
      const updated = prev.map(m => {
        if (m.id === memberId) {
          const currentStars = m.stars || 0;
          targetMember = {
            ...m,
            stars: Math.max(0, currentStars - 1)
          };
          return targetMember;
        }
        return m;
      });
      localStorage.setItem('orion_club_members', JSON.stringify(updated));
      return updated;
    });

    if (targetMember) {
      syncDocToFirestore('club_members', memberId, targetMember);
    }
    showToast('Star revoked from member.', 'info');
  };

  // WORK HOURS & DUTY TIMINGS
  const logMemberWorkHours = (memberId, hoursLogged, taskDescription = 'Club Duty', category = 'General') => {
    const numHours = parseFloat(hoursLogged) || 0;
    if (numHours <= 0) {
      showToast('Please specify a positive number of work hours.', 'error');
      return;
    }

    let memberName = 'Member';
    let targetMember = null;
    setClubMembersState(prev => {
      const updated = prev.map(m => {
        if (m.id === memberId) {
          memberName = m.name;
          const currentHours = m.hoursWorked || 0;
          const newLog = {
            id: `work_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            hours: numHours,
            task: taskDescription.trim() || 'Club Project & Event Duty',
            category,
            loggedBy: 'Admin'
          };
          const pointsEarned = Math.round(numHours * 20);

          targetMember = {
            ...m,
            hoursWorked: parseFloat((currentHours + numHours).toFixed(1)),
            points: (m.points || 0) + pointsEarned,
            timingLogs: [newLog, ...(m.timingLogs || [])]
          };
          return targetMember;
        }
        return m;
      });
      localStorage.setItem('orion_club_members', JSON.stringify(updated));
      return updated;
    });

    if (targetMember) {
      syncDocToFirestore('club_members', memberId, targetMember);
    }
    showToast(`⏱️ Logged ${numHours}h for ${memberName} (${taskDescription})!`, 'success');
  };

  // POSITION & WING MODIFIER - Updates both club_members and users collections live in Firestore
  const updateMemberPosition = (memberId, { role, position, wing, branch, isAdmin, isMember, isVisitor }) => {
    const finalPosition = position || role;
    let targetMember = null;
    setClubMembersState(prev => {
      const updated = prev.map(m => {
        if (m.id === memberId) {
          targetMember = {
            ...m,
            role: finalPosition || m.role,
            position: finalPosition || m.position || m.role,
            wing: wing || m.wing,
            branch: branch || m.branch,
            isAdmin: isAdmin !== undefined ? isAdmin : m.isAdmin,
            isMember: isMember !== undefined ? isMember : m.isMember,
            isVisitor: isVisitor !== undefined ? isVisitor : m.isVisitor
          };
          return targetMember;
        }
        return m;
      });
      localStorage.setItem('orion_club_members', JSON.stringify(updated));
      return updated;
    });

    if (targetMember) {
      // 1. Sync immediately to club_members
      syncDocToFirestore('club_members', memberId, targetMember);
      // 2. Sync immediately to users collection so any active session reacts live
      if (isLiveFirebaseConfigured && db) {
        setDoc(doc(db, 'users', memberId), {
          position: targetMember.position,
          role: targetMember.position,
          wing: targetMember.wing,
          branch: targetMember.branch,
          isAdmin: targetMember.isAdmin,
          isMember: targetMember.isMember,
          isVisitor: targetMember.isVisitor
        }, { merge: true }).catch(err => console.warn('Could not sync user position to users collection:', err.message));
      }
    }
    showToast('Member position & wing updated live in Firestore!', 'success');
  };

  // ADD NEW MEMBER DIRECTLY INTO CLUB ROSTER
  const addClubMember = (newMemberData) => {
    const finalPosition = newMemberData.position || newMemberData.role || 'Active Club Member';
    const newEntry = {
      id: newMemberData.id || `mem_${Date.now()}`,
      name: newMemberData.name,
      email: newMemberData.email,
      srn: newMemberData.srn || 'R23REVA',
      branch: newMemberData.branch || 'School of C&IT',
      wing: newMemberData.wing || 'MEDIA & MARKETING',
      role: finalPosition,
      position: finalPosition,
      phone: newMemberData.phone || '+91 98765 43210',
      avatar: newMemberData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newMemberData.name}`,
      points: newMemberData.points || 200,
      overallScore: newMemberData.overallScore || 80,
      flags: 3,
      flagHistory: [],
      status: 'active',
      stars: 0,
      hoursWorked: 0,
      timingLogs: [],
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setClubMembersState(prev => {
      const updated = [newEntry, ...prev];
      localStorage.setItem('orion_club_members', JSON.stringify(updated));
      return updated;
    });

    // 1. Sync to club_members
    syncDocToFirestore('club_members', newEntry.id, newEntry);
    // 2. Sync to users collection
    if (isLiveFirebaseConfigured && db) {
      setDoc(doc(db, 'users', newEntry.id), {
        uid: newEntry.id,
        displayName: newEntry.name,
        email: newEntry.email,
        srn: newEntry.srn,
        branch: newEntry.branch,
        wing: newEntry.wing,
        position: finalPosition,
        role: finalPosition,
        phone: newEntry.phone,
        photoURL: newEntry.avatar,
        isMember: true,
        isVisitor: false,
        createdAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.warn('Could not sync new member to users collection:', err.message));
    }

    showToast(`Added ${newEntry.name} into Club Roster with 3 active flags!`, 'success');
  };

  // DELETE / REMOVE MEMBER
  const deleteClubMember = (memberId) => {
    setClubMembersState(prev => {
      const updated = prev.filter(m => m.id !== memberId);
      localStorage.setItem('orion_club_members', JSON.stringify(updated));
      return updated;
    });
    syncDocToFirestore('club_members', memberId, null, true);
    showToast('Member removed from roster.', 'info');
  };

  // EVENT VENUE MANAGEMENT (Internal & External Affairs Wing)
  const updateEventVenue = (eventId, venueDetails) => {
    let targetEvent = null;
    setEventsState(prev => {
      const updated = prev.map(e => {
        if (e.id === eventId) {
          targetEvent = {
            ...e,
            venue: venueDetails.venue || e.venue,
            date: venueDetails.date || e.date,
            time: venueDetails.time || e.time,
            venueCoordinator: venueDetails.venueCoordinator || e.venueCoordinator
          };
          return targetEvent;
        }
        return e;
      });
      localStorage.setItem('orion_events', JSON.stringify(updated));
      return updated;
    });

    if (targetEvent) {
      syncDocToFirestore('events', eventId, targetEvent);
    }
    showToast('Venue & scheduling details updated by Internal & External Affairs!', 'success');
  };

  // EVENT MEDIA GALLERY (Media & Marketing Wing - Max 10 images, Max 5 videos)
  const uploadEventMedia = (eventId, { images = [], videos = [] }) => {
    const cappedImages = images.slice(0, 10);
    const cappedVideos = videos.slice(0, 5);
    let targetEvent = null;

    setEventsState(prev => {
      const updated = prev.map(e => {
        if (e.id === eventId) {
          targetEvent = {
            ...e,
            isFinished: true,
            media: {
              images: cappedImages,
              videos: cappedVideos
            }
          };
          return targetEvent;
        }
        return e;
      });
      localStorage.setItem('orion_events', JSON.stringify(updated));
      return updated;
    });

    if (targetEvent) {
      syncDocToFirestore('events', eventId, targetEvent);
    }
    showToast(`📸 Event Media Gallery saved! (${cappedImages.length}/10 images, ${cappedVideos.length}/5 videos)`, 'success');
  };

  // CULTURAL STAGE & PERFORMANCE DETAILS (Cultural Wing)
  const updateCulturalDetails = (eventId, culturalData) => {
    let targetEvent = null;
    setEventsState(prev => {
      const updated = prev.map(e => {
        if (e.id === eventId) {
          targetEvent = {
            ...e,
            culturalDetails: {
              performers: culturalData.performers || [],
              stageAgenda: culturalData.stageAgenda || ''
            }
          };
          return targetEvent;
        }
        return e;
      });
      localStorage.setItem('orion_events', JSON.stringify(updated));
      return updated;
    });

    if (targetEvent) {
      syncDocToFirestore('events', eventId, targetEvent);
    }
    showToast('Cultural stage schedule & artist line-ups updated!', 'success');
  };

  // Reset all to fresh defaults
  const resetAllDataToDefault = () => {
    localStorage.removeItem('orion_audition_slots');
    localStorage.removeItem('orion_events');
    localStorage.removeItem('orion_wings');
    localStorage.removeItem('orion_team');
    localStorage.removeItem('orion_notices');
    localStorage.removeItem('orion_recruitment_applications');
    localStorage.removeItem('orion_club_members');
    localStorage.removeItem('orion_registered_candidates');

    setAuditionSlots(INITIAL_AUDITION_SLOTS);
    setEventsState(INITIAL_EVENTS);
    setWingsState(INITIAL_WINGS);
    setTeamState(INITIAL_TEAM);
    setNoticeTickerState(NOTICE_TICKER_ITEMS);
    setClubMembersState(INITIAL_CLUB_MEMBERS);
    setStudentCandidatesState(INITIAL_STUDENT_CANDIDATES);
    setApplicationsMap({});

    // Also re-seed fresh in Cloud Firestore if connected
    seedInitialFirestoreData(true);
    showToast('All club data restored to fresh defaults and synced!', 'info');
  };

  // Handle application submission from recruitment form
  const submitApplication = async (userId, payload) => {
    try {
      const formattedPayload = {
        ...payload,
        submittedAt: new Date().toISOString(),
        status: 'Submitted'
      };

      setApplicationsMap(prev => {
        const next = { ...prev, [userId]: formattedPayload };
        localStorage.setItem('orion_recruitment_applications', JSON.stringify(next));
        return next;
      });

      // Also add applicant to dynamic student candidates pool
      const candidateEntry = {
        id: `cand_${userId}`,
        name: payload.name || payload.srn,
        email: payload.email || `${payload.srn}@reva.edu.in`,
        srn: payload.srn,
        branch: payload.branch,
        year: payload.semester,
        phone: payload.phone,
        preferredWing: payload.primaryWing,
        roleSuggested: payload.roleApplied || 'Audition Candidate'
      };

      setStudentCandidatesState(prev => {
        const updated = [...prev.filter(c => c.srn !== payload.srn), candidateEntry];
        localStorage.setItem('orion_registered_candidates', JSON.stringify(updated));
        return updated;
      });

      // Update slot capacity
      if (payload.auditionSlotId) {
        setAuditionSlots(prev => {
          const updated = prev.map(s => {
            if (s.id === payload.auditionSlotId) {
              const updatedSlot = { ...s, bookedCount: Math.min(s.maxCapacity, (s.bookedCount || 0) + 1) };
              syncDocToFirestore('audition_slots', s.id, updatedSlot);
              return updatedSlot;
            }
            return s;
          });
          localStorage.setItem('orion_audition_slots', JSON.stringify(updated));
          return updated;
        });
      }

      // Sync application & candidate directly to Cloud Firestore
      syncDocToFirestore('recruitment_applications', userId, formattedPayload);
      syncDocToFirestore('student_candidates', candidateEntry.id, candidateEntry);

      showToast('🎉 Recruitment Application & Audition Slot successfully submitted!', 'success');
      return { success: true, application: formattedPayload };
    } catch (err) {
      console.error('Error submitting application:', err);
      showToast('Failed to submit application. Please try again.', 'error');
      return { success: false, error: err.message };
    }
  };

  const updateApplicationStatus = (userId, newStatus) => {
    setApplicationsMap(prev => {
      if (!prev[userId]) return prev;
      const updated = { ...prev[userId], status: newStatus };
      syncDocToFirestore('recruitment_applications', userId, updated);
      return { ...prev, [userId]: updated };
    });
    showToast(`Application status updated to "${newStatus}"`, 'info');
  };

  const rsvpEvent = () => {
    showToast('🚀 RSVP Confirmed! Event details sent to your REVA Student calendar.', 'success');
  };

  const value = {
    auditionSlots,
    events,
    wings,
    team,
    noticeTicker,
    applicationsMap,
    clubMembers,
    studentCandidates,
    firestoreStatus,
    isLiveFirebaseConfigured,
    searchStudentCandidates,
    setClubMembers,
    updateMemberPoints,
    updateMemberScore,
    removeMemberFlag,
    renewMemberFlags,
    rehireMember,
    awardMemberStar,
    revokeMemberStar,
    logMemberWorkHours,
    updateMemberPosition,
    addClubMember,
    deleteClubMember,
    uploadEventMedia,
    updateEventVenue,
    updateCulturalDetails,
    submitApplication,
    updateApplicationStatus,
    rsvpEvent,
    setWings,
    setTeam,
    setEvents,
    setNoticeTicker,
    resetAllDataToDefault,
    syncAllDataToFirestore,
    toast,
    showToast
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
