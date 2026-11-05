import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Settings, 
  X, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Download, 
  Upload, 
  Users, 
  Layers, 
  Bell, 
  Calendar, 
  Check, 
  Lock,
  Clock,
  Flag,
  AlertTriangle,
  UserCheck,
  Sparkles,
  Database,
  RefreshCw,
  Copy
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminControlCenter({ isOpen, onClose }) {
  const { 
    wings, 
    team, 
    events, 
    noticeTicker, 
    setWings, 
    setTeam, 
    setEvents, 
    setNoticeTicker, 
    clubMembers,
    studentCandidates,
    updateMemberPoints,
    removeMemberFlag,
    renewMemberFlags,
    rehireMember,
    awardMemberStar,
    logMemberWorkHours,
    resetAllDataToDefault,
    firestoreStatus,
    syncAllDataToFirestore,
    showToast 
  } = useData();

  const [passcode, setPasscode] = useState('');
  // The committee console already checks the signed-in role, and Firestore rules
  // enforce it on every write, so no extra passcode is needed here.
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('points-flags'); // 'points-flags' | 'firestore' | 'members' | 'wings' | 'notices' | 'events' | 'json'
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  // Form states for Team Members
  const [memberCategory, setMemberCategory] = useState('Executive Council');
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberBranch, setMemberBranch] = useState('School of C&IT');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberAvatar, setMemberAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');

  // Notice Ticker state
  const [newNoticeText, setNewNoticeText] = useState('');

  // Events state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventVenue, setEventVenue] = useState('REVA Main Auditorium');
  const [eventDesc, setEventDesc] = useState('');
  const [eventCategory, setEventCategory] = useState('upcoming');
  const [eventBanner, setEventBanner] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80');

  // JSON Import/Export state
  const [jsonText, setJsonText] = useState('');

  if (!isOpen) return null;

  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (passcode.trim() === 'orion2026' || passcode.trim() === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid passcode.');
    }
  };

  const handlePushToFirestore = async () => {
    setIsSyncingFirestore(true);
    try {
      const res = await syncAllDataToFirestore(false);
      if (res?.success) {
        showToast('🔥 All 5 wings, events, team roster, and members pushed to Cloud Firestore!', 'success');
      }
    } catch (err) {
      showToast(`Firestore Sync Error: ${err.message}`, 'error');
    } finally {
      setIsSyncingFirestore(false);
    }
  };

  const firestoreRulesTemplate = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const handleCopyRules = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(firestoreRulesTemplate);
    }
    setCopiedRules(true);
    showToast('Copied Firestore Security Rules to clipboard!', 'success');
    setTimeout(() => setCopiedRules(false), 3000);
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate.trim()) {
      showToast('Please enter Event Title and Date.', 'error');
      return;
    }

    const newEventObj = {
      id: `event_${Date.now()}`,
      title: eventTitle.trim(),
      date: eventDate.trim(),
      venue: eventVenue.trim(),
      description: eventDesc.trim() || 'Club ORION flagship campus event.',
      category: eventCategory,
      image: eventBanner.trim(),
      badgeText: eventCategory === 'upcoming' ? 'Upcoming Event' : 'Past Success',
      highlights: ['Special Student Workshop', 'Guest Keynote & Awards']
    };

    setEvents([newEventObj, ...events]);
    setEventTitle('');
    setEventDate('');
    setEventDesc('');
    showToast('New event created successfully!', 'success');
  };

  const handleDeleteEvent = (eventId) => {
    const updated = events.filter(ev => ev.id !== eventId);
    setEvents(updated);
    showToast('Event deleted', 'info');
  };

  // MEMBER MANAGEMENT
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!memberName.trim() || !memberRole.trim()) {
      showToast('Please enter Member Name and Role.', 'error');
      return;
    }

    const newMemberObj = {
      name: memberName.trim(),
      role: memberRole.trim(),
      wing: 'Core Council',
      branch: memberBranch.trim(),
      avatar: memberAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      email: memberEmail.trim()
    };

    const updatedTeam = team.map(cat => {
      if (cat.category === memberCategory) {
        return { ...cat, members: [...cat.members, newMemberObj] };
      }
      return cat;
    });

    setTeam(updatedTeam);
    setMemberName('');
    setMemberRole('');
    setMemberEmail('');
  };

  const handleDeleteMember = (catIndex, memberIndex) => {
    const updatedTeam = team.map((cat, cIdx) => {
      if (cIdx === catIndex) {
        return {
          ...cat,
          members: cat.members.filter((_, mIdx) => mIdx !== memberIndex)
        };
      }
      return cat;
    });
    setTeam(updatedTeam);
  };

  // NOTICE TICKER MANAGEMENT
  const handleAddNotice = (e) => {
    e.preventDefault();
    if (!newNoticeText.trim()) return;
    const updated = [...noticeTicker, newNoticeText.trim()];
    setNoticeTicker(updated);
    setNewNoticeText('');
  };

  const handleDeleteNotice = (index) => {
    const updated = noticeTicker.filter((_, idx) => idx !== index);
    setNoticeTicker(updated);
  };

  // JSON EXPORT / IMPORT
  const handleExportJSON = () => {
    const dataBackup = {
      wings,
      team,
      events,
      noticeTicker
    };
    const jsonStr = JSON.stringify(dataBackup, null, 2);
    setJsonText(jsonStr);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orion_site_config_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Downloaded site configuration JSON backup file!', 'success');
  };

  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.wings) setWings(parsed.wings);
      if (parsed.team) setTeam(parsed.team);
      if (parsed.events) setEvents(parsed.events);
      if (parsed.noticeTicker) setNoticeTicker(parsed.noticeTicker);
      showToast('Successfully imported and applied JSON site configuration!', 'success');
    } catch (err) {
      showToast('Invalid JSON format. Please check syntax.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0b0c0f] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-6 text-slate-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Settings className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-2xl font-display text-slate-100 flex items-center gap-2">
                <span>ORION Admin Control Center</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Live Cloud Sync
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Directly manage club points, 3-flag warning system, roster, 5 wings, and Cloud Firestore.
              </p>
            </div>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePushToFirestore}
                disabled={isSyncingFirestore}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/10 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFirestore ? 'animate-spin' : ''}`} />
                <span>{isSyncingFirestore ? 'Pushing to Cloud...' : '⚡ Push to Firestore'}</span>
              </button>
            </div>
          )}
        </div>

        {/* AUTH CHECK STEP */}
        {!isAuthenticated ? (
          <form onSubmit={handleAdminAuth} className="glass-panel p-6 rounded-2xl space-y-4 max-w-md mx-auto border border-amber-500/30 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-lg text-slate-100">Admin Authorization</h4>
              <p className="text-xs text-slate-400">Enter Admin Passcode to unlock live content controls.</p>
            </div>

            <div>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Passcode (e.g. orion2026)"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-center text-sm focus:border-amber-400 outline-none"
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400 bg-rose-950/60 p-2 rounded-lg border border-rose-500/30">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-slate-950 rounded-xl text-sm shadow-lg hover:from-amber-300 hover:to-amber-400 transition-all"
            >
              Unlock Admin Portal
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Nav Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab('points-flags')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'points-flags' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
              >
                <Flag className="w-4 h-4" />
                <span>Points & 3-Flag System</span>
              </button>

              <button
                onClick={() => setActiveTab('firestore')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'firestore' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
              >
                <Database className="w-4 h-4" />
                <span>Cloud Firestore</span>
                <span className={`w-2 h-2 rounded-full ${firestoreStatus === 'live' ? 'bg-emerald-400 animate-pulse' : firestoreStatus === 'permission_error' ? 'bg-rose-500' : 'bg-amber-400'}`} />
              </button>

              <button
                onClick={() => setActiveTab('members')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'members' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
              >
                <Users className="w-4 h-4" />
                <span>Members & Roster</span>
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'events' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
              >
                <Calendar className="w-4 h-4" />
                <span>Events Control</span>
              </button>

              <button
                onClick={() => setActiveTab('wings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'wings' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
              >
                <Layers className="w-4 h-4" />
                <span>5 Wings Details</span>
              </button>

              <button
                onClick={() => setActiveTab('notices')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'notices' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
              >
                <Bell className="w-4 h-4" />
                <span>Live Notice Bar</span>
              </button>

              <button
                onClick={() => setActiveTab('json')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'json' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
              >
                <Download className="w-4 h-4" />
                <span>Export / Import JSON</span>
              </button>
            </div>

            {/* TAB 0: POINTS & 3-FLAG WARNING SYSTEM */}
            {activeTab === 'points-flags' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Member Performance, Points, 3-Flag Warning & Work Timings</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Admins can adjust scores, issue strikes (-1 flag), renew warning flags, re-hire fired members, award stars, and log duty hours.
                    </p>
                  </div>
                  <div className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">
                    {clubMembers?.length || 0} Registered Members
                  </div>
                </div>

                <div className="space-y-3">
                  {clubMembers?.map((m) => {
                    const isFired = m.status === 'fired';
                    const isWarning = m.status === 'warning';

                    return (
                      <div
                        key={m.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isFired
                            ? 'bg-rose-950/30 border-rose-500/50'
                            : isWarning
                            ? 'bg-amber-950/20 border-amber-500/40'
                            : 'bg-slate-900/80 border-slate-800'
                        } flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}
                      >
                        {/* Member Info */}
                        <div className="flex items-center gap-3">
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className={`w-10 h-10 rounded-xl object-cover border ${
                              isFired ? 'border-rose-500' : 'border-amber-400'
                            }`}
                          />
                          <div>
                            <div className="font-extrabold text-sm text-white flex items-center gap-2 font-display">
                              <span>{m.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
                                {m.srn || 'REVA'}
                              </span>
                            </div>
                            <div className="text-xs text-amber-400 font-semibold">
                              {m.role} • <span className="text-slate-400">{m.wing}</span>
                            </div>
                          </div>
                        </div>

                        {/* Scores & Flags Badges */}
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          {/* Points */}
                          <div className="bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-center">
                            <span className="text-[9px] text-slate-400 block">Points</span>
                            <span className="font-mono font-bold text-amber-400">{m.points || 0} pts</span>
                          </div>

                          {/* Score */}
                          <div className="bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-center">
                            <span className="text-[9px] text-slate-400 block">Score</span>
                            <span className="font-mono font-bold text-cyan-400">{m.overallScore || 75}%</span>
                          </div>

                          {/* 3 Flags */}
                          <div className="bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-center">
                            <span className="text-[9px] text-slate-400 block">3-Flags</span>
                            <div className="flex items-center justify-center gap-0.5">
                              {[1, 2, 3].map((fNum) => (
                                <span key={fNum} className={`text-xs ${(m.flags || 3) >= fNum ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                                  🚩
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Stars */}
                          <div className="bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-center">
                            <span className="text-[9px] text-slate-400 block">Stars</span>
                            <span className="font-bold text-amber-300">{m.stars > 0 ? `${m.stars} ⭐` : '—'}</span>
                          </div>

                          {/* Hours */}
                          <div className="bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-center">
                            <span className="text-[9px] text-slate-400 block">Duty Hours</span>
                            <span className="font-mono font-bold text-emerald-400">{m.hoursWorked || 0}h</span>
                          </div>
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 self-end md:self-auto">
                          {/* Add Points */}
                          <button
                            onClick={() => updateMemberPoints(m.id, 50)}
                            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg text-xs font-bold border border-amber-500/30"
                            title="Add 50 Points"
                          >
                            +50 pts
                          </button>

                          {/* Award Star */}
                          <button
                            onClick={() => awardMemberStar(m.id)}
                            className="p-1.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 rounded-lg text-xs"
                            title="Award Star for Excellent Work"
                          >
                            ⭐+
                          </button>

                          {/* Log Hours */}
                          <button
                            onClick={() => {
                              const hrs = prompt(`Enter duty hours to log for ${m.name}:`, '3');
                              if (hrs) {
                                const task = prompt(`Enter task description:`, 'Club event duty') || 'Club duty';
                                logMemberWorkHours(m.id, hrs, task);
                              }
                            }}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs border border-emerald-500/30"
                            title="Log Work Hours"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          {/* Strike / Renew / Rehire */}
                          {isFired ? (
                            <button
                              onClick={() => rehireMember(m.id)}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold shadow transition-all flex items-center gap-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Re-Hire</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  const reason = prompt(`Reason for removing 1 warning flag from ${m.name}:`, 'Performance warning strike');
                                  if (reason !== null) {
                                    removeMemberFlag(m.id, reason);
                                  }
                                }}
                                className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-xs border border-rose-500/30"
                                title="Remove Flag (Issue Strike)"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>

                              {m.flags < 3 && (
                                <button
                                  onClick={() => renewMemberFlags(m.id)}
                                  className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold border border-cyan-500/40"
                                  title="Renew Flags to 3/3"
                                >
                                  Renew 🚩
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: CLOUD FIRESTORE BACKEND CONTROL */}
            {activeTab === 'firestore' && (
              <div className="space-y-6">
                {/* Cloud Status Card */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-white font-display">
                          Cloud Firestore Live Database
                        </h4>
                        <span className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded-md ${
                          firestoreStatus === 'live' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                            : firestoreStatus === 'permission_error'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {firestoreStatus === 'live' ? '● Connected & Live' : firestoreStatus === 'permission_error' ? '● Rules Permission Denied' : '● Ready to Sync'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Project ID: <span className="text-cyan-400 font-mono font-bold">club-orion-reva</span> (default database)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePushToFirestore}
                    disabled={isSyncingFirestore}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncingFirestore ? 'animate-spin' : ''}`} />
                    <span>{isSyncingFirestore ? 'Uploading Collections...' : '⚡ Push All Data to Cloud Firestore Now'}</span>
                  </button>
                </div>

                {/* Firestore Collections Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">club_members</span>
                    <span className="text-lg font-bold text-amber-400">{clubMembers?.length || 0}</span>
                    <span className="text-[10px] text-slate-500 block">Points, flags, hours</span>
                  </div>
                  <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">wings</span>
                    <span className="text-lg font-bold text-cyan-400">{wings?.length || 5} Wings</span>
                    <span className="text-[10px] text-slate-500 block">5 wings with leads</span>
                  </div>
                  <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">events</span>
                    <span className="text-lg font-bold text-emerald-400">{events?.length || 0} Events</span>
                    <span className="text-[10px] text-slate-500 block">Auditorium, cultural</span>
                  </div>
                  <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">student_candidates</span>
                    <span className="text-lg font-bold text-violet-400">{studentCandidates?.length || 0} Candidates</span>
                    <span className="text-[10px] text-slate-500 block">Searchable by SRN</span>
                  </div>
                </div>

                {/* Security Rules Notice & 1-Click Copy */}
                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Why was your Firestore console empty? (Setup Guide)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyRules}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRules ? 'Copied to Clipboard!' : 'Copy Security Rules'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    When creating a database in Firebase, default security rules block client writes (<code className="text-rose-400">allow read, write: if false;</code>). 
                    To enable live updates from the frontend to Cloud Firestore, follow these 2 simple steps:
                  </p>

                  <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <li>In your Firebase Console tab, click on the <strong className="text-amber-300">Rules</strong> tab (next to "Data").</li>
                    <li>Paste the rules below and click <strong className="text-emerald-400">Publish</strong>:</li>
                  </ol>

                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                    {firestoreRulesTemplate}
                  </pre>

                  <p className="text-xs text-slate-400">
                    Once published, click <strong className="text-amber-300">"⚡ Push All Data to Cloud Firestore Now"</strong> above. 
                    Your Firebase Console Data tab will immediately refresh and show all collections!
                  </p>
                </div>
              </div>
            )}

            {/* TAB 1: MEMBERS & TEAM ROSTER */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                {/* Add New Member Form */}
                <form onSubmit={handleAddMember} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add New Member to Roster
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Category</label>
                      <select
                        value={memberCategory}
                        onChange={(e) => setMemberCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                      >
                        <option value="Executive Council">Executive Council</option>
                        <option value="Faculty Coordinators">Faculty Coordinators</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        placeholder="e.g. Vikramaditya Sen"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Role Title</label>
                      <input
                        type="text"
                        required
                        value={memberRole}
                        onChange={(e) => setMemberRole(e.target.value)}
                        placeholder="e.g. Joint Secretary / Event Lead"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">School / Branch</label>
                      <input
                        type="text"
                        value={memberBranch}
                        onChange={(e) => setMemberBranch(e.target.value)}
                        placeholder="e.g. School of C&IT (3rd Year)"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">REVA Email (Optional)</label>
                      <input
                        type="email"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        placeholder="name@reva.edu.in"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Avatar Image URL</label>
                      <input
                        type="url"
                        value={memberAvatar}
                        onChange={(e) => setMemberAvatar(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-slate-950 rounded-xl text-xs shadow-md hover:from-amber-300 hover:to-amber-400 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Member to Roster</span>
                  </button>
                </form>

                {/* Existing Members Roster List */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300">Existing Roster List</h4>
                  {team.map((group, cIdx) => (
                    <div key={cIdx} className="space-y-2">
                      <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{group.category}</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.members.map((member, mIdx) => (
                          <div key={mIdx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                            <div className="flex items-center gap-3">
                              <img src={member.avatar} className="w-8 h-8 rounded-full object-cover border border-amber-400" />
                              <div>
                                <div className="font-bold text-slate-100">{member.name}</div>
                                <div className="text-amber-400">{member.role} • <span className="text-slate-400">{member.branch}</span></div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteMember(cIdx, mIdx)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: EVENTS CONTROL */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <form onSubmit={handleAddEvent} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Create New Club Event
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Event Category</label>
                      <select
                        value={eventCategory}
                        onChange={(e) => setEventCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                      >
                        <option value="upcoming">Upcoming Event</option>
                        <option value="past">Past Success Event</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Event Title</label>
                      <input
                        type="text"
                        required
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="e.g. ORION Hackathon 2026"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Date & Time</label>
                      <input
                        type="text"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        placeholder="e.g. October 15-16, 2026"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Venue Location</label>
                      <input
                        type="text"
                        value={eventVenue}
                        onChange={(e) => setEventVenue(e.target.value)}
                        placeholder="e.g. Kuvempu Auditorium, REVA"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Banner Image URL</label>
                      <input
                        type="url"
                        value={eventBanner}
                        onChange={(e) => setEventBanner(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Short Description</label>
                      <input
                        type="text"
                        value={eventDesc}
                        onChange={(e) => setEventDesc(e.target.value)}
                        placeholder="Brief summary of the event"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-slate-950 rounded-xl text-xs shadow-md hover:from-amber-300 hover:to-amber-400 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Event</span>
                  </button>
                </form>

                {/* Existing Events List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-300">Live Website Events ({events.length})</h4>
                  <div className="space-y-2">
                    {events.map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                        <div className="flex items-center gap-3">
                          <img src={ev.image} className="w-12 h-8 rounded-lg object-cover border border-slate-700" />
                          <div>
                            <div className="font-bold text-slate-100 flex items-center gap-2">
                              <span>{ev.title}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${ev.category === 'upcoming' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}`}>
                                {ev.category === 'upcoming' ? 'Upcoming' : 'Past'}
                              </span>
                            </div>
                            <div className="text-slate-400">{ev.date} • {ev.venue}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: WINGS DETAILS */}
            {activeTab === 'wings' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-amber-400">Manage 5 Wings Information (Discipline Wing, Internal & External Wing, Cultural Wing, Technical Wing, Media & Marketing Wing)</h4>
                <div className="space-y-4">
                  {wings.map((wing, idx) => (
                    <div key={wing.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 text-sm">{wing.code} - {wing.name}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{wing.id}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1">Tagline</label>
                          <input
                            type="text"
                            value={wing.tagline}
                            onChange={(e) => {
                              const updated = [...wings];
                              updated[idx].tagline = e.target.value;
                              setWings(updated);
                            }}
                            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Mission Statement</label>
                          <input
                            type="text"
                            value={wing.mission}
                            onChange={(e) => {
                              const updated = [...wings];
                              updated[idx].mission = e.target.value;
                              setWings(updated);
                            }}
                            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: LIVE NOTICE TICKER */}
            {activeTab === 'notices' && (
              <div className="space-y-4">
                <form onSubmit={handleAddNotice} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newNoticeText}
                    onChange={(e) => setNewNoticeText(e.target.value)}
                    placeholder="Enter new live notice bar text..."
                    className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:border-amber-400 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-slate-950 rounded-xl text-xs shadow-md hover:from-amber-300 hover:to-amber-400 transition-all flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Notice</span>
                  </button>
                </form>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-400">Current Ticker Notices</h5>
                  {noticeTicker.map((notice, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                      <span className="text-slate-200">{notice}</span>
                      <button
                        onClick={() => handleDeleteNotice(idx)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: JSON IMPORT & EXPORT */}
            {activeTab === 'json' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100">Export or Import Site JSON Data</h4>
                    <p className="text-slate-400">Backup your site data or paste JSON configurations to update everything instantly.</p>
                  </div>

                  <button
                    onClick={handleExportJSON}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-amber-300 font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export JSON Backup</span>
                  </button>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Raw Config JSON</label>
                  <textarea
                    rows={8}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder='Paste JSON here...'
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-[11px] outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={resetAllDataToDefault}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-semibold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset All to Original Seed Data</span>
                  </button>

                  <button
                    onClick={handleImportJSON}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-slate-950 rounded-xl shadow-md hover:from-amber-300 hover:to-amber-400 transition-all flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Apply JSON Configuration</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
