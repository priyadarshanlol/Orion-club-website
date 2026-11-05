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
  INITIAL_DISPATCHES,
  INITIAL_VENUES,
  INITIAL_DISCIPLINE_CASES
} from '../lib/content';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  db, 
  auth,
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

// Bump when the shape or naming of the seed data changes, so browsers holding an
// old copy in localStorage (for example the old wing names) start fresh.
const DATA_VERSION = '3-official-wing-names';
try {
  if (localStorage.getItem('orion_data_version') !== DATA_VERSION) {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('orion_') && k !== 'orion_sound_choice')
      .forEach((k) => localStorage.removeItem(k));
    localStorage.setItem('orion_data_version', DATA_VERSION);
  }
} catch {
  // storage blocked: nothing cached to clear
}

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

  // 3. Wings State with 5-Wing Migration (Discipline Wing, Internal & External Wing, Cultural, Technical Wing, Media)
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
        if (parsed.length >= 5 && parsed.some(m => m.wing === 'Discipline Wing' || m.wing === 'Cultural Wing')) return parsed;
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

  // Portal data: notices, venues, discipline log, platform switches and the audit trail
  const loadLocal = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };
  const saveLocal = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or blocked: keep the in-memory copy
    }
  };

  const [dispatches, setDispatches] = useState(() => loadLocal('orion_dispatches', INITIAL_DISPATCHES));
  const [spotlights, setSpotlights] = useState(() => loadLocal('orion_spotlights', []));
  const [inquiries, setInquiries] = useState(() => loadLocal('orion_inquiries', []));
  const [registrations, setRegistrations] = useState(() => loadLocal('orion_registrations', []));
  const [eventSettings, setEventSettings] = useState(() => loadLocal('orion_event_settings', {}));
  const [venues, setVenues] = useState(() => loadLocal('orion_venues', INITIAL_VENUES));
  const [disciplineCases, setDisciplineCases] = useState(() => loadLocal('orion_discipline_cases', INITIAL_DISCIPLINE_CASES));
  const [platformSwitches, setPlatformSwitches] = useState(() => loadLocal('orion_platform_switches', {
    publicRsvp: true,
    recruitmentOpen: true,
    maintenanceMode: false
  }));
  const [auditLog, setAuditLog] = useState(() => loadLocal('orion_audit_log', [
    { id: 'aud-seed-3', at: '2026-10-05 18:10', operator: 'Nikhil Rao', action: 'Published notice', target: 'Charter review: the 3-flag system for this term', wing: 'Discipline Wing' },
    { id: 'aud-seed-2', at: '2026-09-28 11:40', operator: 'Deepak Raj', action: 'Booked venue', target: 'Main Open Air Theatre (OAT) for Aura 2026', wing: 'Internal & External Wing' },
    { id: 'aud-seed-1', at: '2026-09-01 09:00', operator: 'Siddharth Rao', action: 'Opened recruitment', target: 'Recruitment 2026', wing: 'CORE LEADERSHIP' }
  ]));
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
      // 7. Notices
      await setDoc(doc(db, 'notices', 'current'), { items: NOTICE_TICKER_ITEMS, updatedAt: serverTimestamp() }, { merge: true });

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

  // Who is signed in to Firebase. Private collections (candidates, registrations,
  // inbox) only open up after sign-in, so the listeners re-attach when this changes.
  const [authUid, setAuthUid] = useState(null);
  useEffect(() => {
    if (!isLiveFirebaseConfigured || !auth) return;
    return onAuthStateChanged(auth, (u) => setAuthUid(u?.uid || null));
  }, []);

  // Real-time Cloud Firestore synchronization listeners
  useEffect(() => {
    if (!isLiveFirebaseConfigured || !db) return;

    let unsubMembers, unsubEvents, unsubWings, unsubTeam, unsubSlots, unsubCandidates, unsubApps, unsubNotices;
    const extraUnsubs = [];

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
          // Empty database: keep showing the built-in starting data. A committee
          // member loads it into Firestore from Committee console → Advanced → Push.
          setFirestoreStatus('live');
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
      if (authUid) unsubCandidates = onSnapshot(collection(db, 'student_candidates'), (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
          setStudentCandidatesState(list);
          localStorage.setItem('orion_registered_candidates', JSON.stringify(list));
        }
      }, (err) => console.warn('student_candidates snapshot error:', err.message));

      // 7. Applications Listener
      if (authUid) unsubApps = onSnapshot(collection(db, 'recruitment_applications'), (snapshot) => {
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

      // 9. Spotlights (public), registrations and inbox (committee only; others get
      // permission-denied from the security rules, which is expected)
      const listen = (name, setter) =>
        onSnapshot(collection(db, name), (snapshot) => {
          const list = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
          list.sort((a, b) => String(b.createdAt || b.date || '').localeCompare(String(a.createdAt || a.date || '')));
          setter(list);
        }, (err) => { if (err.code !== 'permission-denied') console.warn(`${name} snapshot error:`, err.message); });
      extraUnsubs.push(listen('spotlights', setSpotlights), listen('registrations', setRegistrations), listen('inquiries', setInquiries));
    } catch (err) {
      console.warn('Error establishing Firestore listeners:', err);
    }

    return () => {
      extraUnsubs.forEach(u => u && u());
      if (unsubMembers) unsubMembers();
      if (unsubEvents) unsubEvents();
      if (unsubWings) unsubWings();
      if (unsubTeam) unsubTeam();
      if (unsubSlots) unsubSlots();
      if (unsubCandidates) unsubCandidates();
      if (unsubApps) unsubApps();
      if (unsubNotices) unsubNotices();
    };
  }, [authUid]);

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
            issuedBy: 'Discipline Wing Directorate',
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
                issuedBy: 'Discipline Wing Directorate',
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
      wing: newMemberData.wing || 'Media & Marketing Wing',
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

  // ---------- Member spotlight ----------
  // Starts empty on purpose: entries are added by the committee, never invented.
  const addSpotlight = ({ memberName, wing, title, detail, date, postUrl, platform, operator }) => {
    const entry = {
      id: `spot-${Date.now()}`,
      memberName: memberName.trim(),
      wing: wing || '',
      title: title.trim(),
      detail: (detail || '').trim(),
      date: date || new Date().toISOString().slice(0, 10),
      postUrl: (postUrl || '').trim(),
      platform: platform || 'Instagram',
    };
    setSpotlights(prev => {
      const next = [entry, ...prev];
      saveLocal('orion_spotlights', next);
      return next;
    });
    syncDocToFirestore('spotlights', entry.id, entry);
    recordAudit(operator, 'Added spotlight', `${entry.memberName}: ${entry.title}`, entry.wing);
    showToast('Spotlight published', 'success');
    return entry;
  };

  const removeSpotlight = (id, operator) => {
    const gone = spotlights.find(sp => sp.id === id);
    setSpotlights(prev => {
      const next = prev.filter(sp => sp.id !== id);
      saveLocal('orion_spotlights', next);
      return next;
    });
    syncDocToFirestore('spotlights', id, null, true);
    if (gone) recordAudit(operator, 'Removed spotlight', `${gone.memberName}: ${gone.title}`, gone.wing);
  };

  // ---------- Connect with ORION messages ----------
  const submitInquiry = ({ name, email, topic, message }) => {
    const entry = {
      id: `msg-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      topic,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    setInquiries(prev => {
      const next = [entry, ...prev];
      saveLocal('orion_inquiries', next);
      return next;
    });
    syncDocToFirestore('inquiries', entry.id, entry);
    return entry;
  };

  const setInquiryStatus = (id, status) => {
    setInquiries(prev => {
      const next = prev.map(m => (m.id === id ? { ...m, status } : m));
      saveLocal('orion_inquiries', next);
      return next;
    });
    syncDocToFirestore('inquiries', id, { status });
  };

  // ---------- Event registration ----------
  // Settings per event: fee in rupees (0 = free), capacity (0 = unlimited), open or closed.
  const eventSettingsFor = (eventId) => ({
    fee: 0,
    capacity: 0,
    registrationOpen: true,
    ...(events.find(e => e.id === eventId)?.registration || {}),
    ...(eventSettings[eventId] || {}),
  });

  const updateEventSettings = (eventId, patch, operator) => {
    const merged = { ...eventSettingsFor(eventId), ...patch };
    setEventSettings(prev => {
      const next = { ...prev, [eventId]: merged };
      saveLocal('orion_event_settings', next);
      return next;
    });
    syncDocToFirestore('events', eventId, { registration: merged });
    const ev = events.find(e => e.id === eventId);
    recordAudit(operator, 'Updated registration settings', ev?.title || eventId);
  };

  const registrationsFor = (eventId) => registrations.filter(r => r.eventId === eventId);

  // Live site: the server creates the registration and decides fee, status and
  // waitlist (api/registrations/create). Preview copy: same rules, in this browser.
  const registerForEvent = async (eventId, form) => {
    if (isLiveFirebaseConfigured) {
      const res = await fetch('/api/registrations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, ...form }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, reason: res.status === 409 ? 'closed' : 'error', message: data.error };
      if (data.registration) {
        setRegistrations(prev => [data.registration, ...prev.filter(r => r.id !== data.registration.id)]);
      }
      return data;
    }

    const settings = eventSettingsFor(eventId);
    const email = form.email.trim().toLowerCase();
    const existing = registrations.find(r => r.eventId === eventId && r.email === email && r.status !== 'cancelled');
    if (existing) return { ok: false, reason: 'already', registration: existing };
    if (!settings.registrationOpen) return { ok: false, reason: 'closed' };
    const taken = registrations.filter(r => r.eventId === eventId && (r.status === 'confirmed' || r.status === 'pending_payment')).length;
    const full = settings.capacity > 0 && taken >= settings.capacity;
    const reg = {
      id: `REG-${Date.now().toString(36).toUpperCase()}`,
      eventId,
      name: form.name.trim(),
      email,
      phone: form.phone.trim(),
      srn: (form.srn || '').trim().toUpperCase(),
      school: (form.school || '').trim(),
      year: form.year || '',
      createdAt: new Date().toISOString(),
      amount: settings.fee,
      paid: false,
      status: full ? 'waitlisted' : settings.fee > 0 ? 'pending_payment' : 'confirmed',
    };
    setRegistrations(prev => {
      const next = [reg, ...prev];
      saveLocal('orion_registrations', next);
      return next;
    });
    return { ok: true, registration: reg };
  };

  // Called only after the server has verified the Razorpay signature (or in preview test mode)
  const markRegistrationPaid = (regId, payment) => {
    setRegistrations(prev => {
      const next = prev.map(r => (r.id === regId ? { ...r, paid: true, status: 'confirmed', payment } : r));
      saveLocal('orion_registrations', next);
      return next;
    });
  };

  const setRegistrationStatus = (regId, status, operator) => {
    const reg = registrations.find(r => r.id === regId);
    setRegistrations(prev => {
      const next = prev.map(r => (r.id === regId ? { ...r, status } : r));
      saveLocal('orion_registrations', next);
      return next;
    });
    syncDocToFirestore('registrations', regId, { status });
    if (reg) recordAudit(operator, `Set registration ${status.replace('_', ' ')}`, `${reg.name} · ${regId}`);
  };

  const findRegistration = (idOrEmail) => {
    const q = idOrEmail.trim().toLowerCase();
    if (!q) return [];
    return registrations.filter(r => r.id.toLowerCase() === q || r.email === q);
  };

  const rsvpEvent = () => {
    showToast('🚀 RSVP Confirmed! Event details sent to your REVA Student calendar.', 'success');
  };

  // ---------- Portal operations ----------
  const stamp = () => new Date().toISOString().slice(0, 16).replace('T', ' ');

  const recordAudit = (operator, action, target, wing = '') => {
    const entry = { id: `aud-${Date.now()}`, at: stamp(), operator: operator || 'Unknown', action, target, wing };
    setAuditLog(prev => {
      const next = [entry, ...prev].slice(0, 200);
      saveLocal('orion_audit_log', next);
      return next;
    });
    syncDocToFirestore('audit_log', entry.id, entry);
  };

  const publishDispatch = ({ title, body, category, author }) => {
    const entry = {
      id: `dsp-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      category,
      author,
      date: new Date().toISOString().slice(0, 10)
    };
    setDispatches(prev => {
      const next = [entry, ...prev];
      saveLocal('orion_dispatches', next);
      return next;
    });
    syncDocToFirestore('dispatches', entry.id, entry);
    recordAudit(author, 'Published notice', entry.title);
    showToast('Notice published to the home page and member dashboards.', 'success');
  };

  const deleteDispatch = (id, operator) => {
    const target = dispatches.find(d => d.id === id);
    setDispatches(prev => {
      const next = prev.filter(d => d.id !== id);
      saveLocal('orion_dispatches', next);
      return next;
    });
    syncDocToFirestore('dispatches', id, null, true);
    recordAudit(operator, 'Removed notice', target?.title || id);
    showToast('Notice removed.', 'info');
  };

  const setVenueStatus = (venueId, status, bookedFor, operator) => {
    let name = venueId;
    const next = venues.map(v => {
      if (v.id !== venueId) return v;
      name = v.name;
      const updated = { ...v, status, bookedFor: status === 'Available' ? '' : (bookedFor ?? v.bookedFor) };
      syncDocToFirestore('venues', v.id, updated);
      return updated;
    });
    setVenues(next);
    saveLocal('orion_venues', next);
    recordAudit(operator, `Set venue to ${status}`, name, 'Internal & External Wing');
    showToast(`${name} is now ${status.toLowerCase()}.`, 'success');
  };

  const addVenue = (venue, operator) => {
    const entry = { id: `ven-${Date.now()}`, status: 'Available', bookedFor: '', amenities: [], ...venue };
    setVenues(prev => {
      const next = [...prev, entry];
      saveLocal('orion_venues', next);
      return next;
    });
    syncDocToFirestore('venues', entry.id, entry);
    recordAudit(operator, 'Added venue', entry.name, 'Internal & External Wing');
    showToast(`${entry.name} added to the venue desk.`, 'success');
  };

  const togglePlatformSwitch = (key, label, operator) => {
    const next = { ...platformSwitches, [key]: !platformSwitches[key] };
    setPlatformSwitches(next);
    saveLocal('orion_platform_switches', next);
    syncDocToFirestore('settings', 'platform', next);
    recordAudit(operator, `${next[key] ? 'Turned on' : 'Turned off'}: ${label}`, 'Platform settings');
  };

  // Logs a discipline record and applies its effect to the member's flags or stars.
  const logDisciplineCase = ({ memberId, severity, category, finding, action, officer }) => {
    const member = clubMembers.find(m => m.id === memberId);
    if (!member) return;
    const entry = {
      id: `case-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      memberId,
      memberName: member.name,
      wing: member.wing,
      severity,
      category: category.trim() || 'General',
      finding: finding.trim(),
      action: action.trim(),
      status: severity === 'Commendation' ? 'Logged' : 'Under review',
      officer
    };
    setDisciplineCases(prev => {
      const next = [entry, ...prev];
      saveLocal('orion_discipline_cases', next);
      return next;
    });
    syncDocToFirestore('discipline_cases', entry.id, entry);
    recordAudit(officer, `Logged ${severity.toLowerCase()} record`, member.name, 'Discipline Wing');
    if (severity === 'Commendation') {
      awardMemberStar(memberId, entry.finding || 'Commendation');
    } else {
      const flagsToRemove = severity === 'High' ? 2 : 1;
      for (let i = 0; i < flagsToRemove; i++) removeMemberFlag(memberId, entry.finding);
    }
  };

  const setCaseStatus = (caseId, status, operator) => {
    const next = disciplineCases.map(c => (c.id === caseId ? { ...c, status } : c));
    setDisciplineCases(next);
    saveLocal('orion_discipline_cases', next);
    const updated = next.find(c => c.id === caseId);
    if (updated) syncDocToFirestore('discipline_cases', caseId, updated);
    recordAudit(operator, `Marked case ${status.toLowerCase()}`, caseId, 'Discipline Wing');
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
    showToast,
    dispatches,
    publishDispatch,
    deleteDispatch,
    venues,
    setVenueStatus,
    addVenue,
    disciplineCases,
    logDisciplineCase,
    setCaseStatus,
    platformSwitches,
    togglePlatformSwitch,
    auditLog,
    recordAudit,
    spotlights,
    inquiries,
    submitInquiry,
    setInquiryStatus,
    addSpotlight,
    removeSpotlight,
    registrations,
    registrationsFor,
    registerForEvent,
    markRegistrationPaid,
    setRegistrationStatus,
    findRegistration,
    eventSettingsFor,
    updateEventSettings
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
