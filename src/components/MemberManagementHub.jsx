import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  RotateCcw, 
  UserCheck, 
  Plus, 
  Search, 
  Lock, 
  Eye, 
  X,
  Star,
  Trash2,
  Upload,
  User,
  LayoutGrid,
  List,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicrosoftLogo } from './MicrosoftAuthModal';

const WING_OPTIONS_LIST = [
  'NANAK',
  'ZAYD-BODHI',
  'KALA-SANSKRITI',
  'ARJUNA',
  'MEDIA & MARKETING'
];

export default function MemberManagementHub({ onOpenAuth }) {
  const { currentUser } = useAuth();
  const { 
    clubMembers, 
    searchStudentCandidates,
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
    showToast 
  } = useData();

  // View state: 'grid' (Card View) | 'table' (Clean Table View)
  const [viewMode, setViewMode] = useState('grid');

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [wingFilter, setWingFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'active' | 'warning' | 'fired'
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'points' | 'hours' | 'stars'

  // Modals
  const [selectedMemberModal, setSelectedMemberModal] = useState(null); // for inspect view
  const [manageMemberModal, setManageMemberModal] = useState(null); // comprehensive manage drawer
  const [manageTab, setManageTab] = useState('points'); // 'points' | 'flags' | 'stars' | 'hours' | 'position'

  // Manage Tab Form States
  const [customPointsInput, setCustomPointsInput] = useState('');
  const [customPointsReason, setCustomPointsReason] = useState('');
  const [customScoreInput, setCustomScoreInput] = useState(85);
  const [warningReason, setWarningReason] = useState('');
  const [starCitation, setStarCitation] = useState('Outstanding Work & Dedication');
  const [logHours, setLogHours] = useState('');
  const [logTask, setLogTask] = useState('');
  const [logCategory, setLogCategory] = useState('Event Duty');
  const [editRole, setEditRole] = useState('');
  const [editWing, setEditWing] = useState('NANAK');
  const [editBranch, setEditBranch] = useState('');

  // Register New Member Modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [newMemName, setNewMemName] = useState('');
  const [newMemEmail, setNewMemEmail] = useState('');
  const [newMemSrn, setNewMemSrn] = useState('');
  const [newMemBranch, setNewMemBranch] = useState('School of C&IT');
  const [newMemPhone, setNewMemPhone] = useState('');
  const [newMemWing, setNewMemWing] = useState('NANAK');
  const [newMemRole, setNewMemRole] = useState('Club Member');
  const [newMemAvatar, setNewMemAvatar] = useState(null);

  // Authority & Membership logic derived directly from user's position in Firestore:
  const userPos = (currentUser?.position || currentUser?.role || '').toLowerCase();
  const userWing = (currentUser?.wing || '').toUpperCase();

  // A user is a member if logged in and their position is not 'visitor' or 'student'
  const isMember = Boolean(
    currentUser && 
    (currentUser.isMember || (!userPos.includes('visitor') && !userPos.includes('guest') && userPos !== ''))
  );

  // Position-based authority:
  // Discipline Directorate (NANAK Director / Secretary / Lead), Core Leadership (President / Vice President), or Backend Admin
  const isDisciplineLeadership = 
    (userWing.includes('NANAK') || userWing.includes('DISCIPLINE')) &&
    (userPos.includes('director') || userPos.includes('secretary') || userPos.includes('lead'));

  const isCoreLeadership = 
    currentUser?.isAdmin || 
    userPos.includes('president') || 
    userPos.includes('director') || 
    userPos.includes('secretary');

  const canManageMembers = isDisciplineLeadership || isCoreLeadership;
  const isVisitor = !currentUser || !isMember;

  // Open Manage Drawer helper
  const openManageModal = (member) => {
    setManageMemberModal(member);
    setManageTab('points');
    setCustomPointsInput('');
    setCustomPointsReason('');
    setCustomScoreInput(member.overallScore || 80);
    setWarningReason('');
    setStarCitation('Outstanding Work & Dedication');
    setLogHours('');
    setLogTask('');
    setEditRole(member.role || 'Club Member');
    setEditWing(member.wing || 'NANAK');
    setEditBranch(member.branch || 'School of C&IT');
  };

  // Personal standing record for logged-in user
  const personalRecord = useMemo(() => {
    if (!currentUser) return null;
    return clubMembers.find(m => 
      m.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
      (currentUser.srn && m.srn?.toUpperCase() === currentUser.srn?.toUpperCase())
    ) || clubMembers[0];
  }, [currentUser, clubMembers]);

  // Autocomplete candidate suggestions for member registration modal
  const candidateSuggestions = useMemo(() => {
    if (!candidateSearchQuery.trim()) return [];
    return searchStudentCandidates(candidateSearchQuery);
  }, [candidateSearchQuery, searchStudentCandidates]);

  // Handle 1-click select candidate in registration modal
  const handleSelectCandidate = (candidate) => {
    setNewMemName(candidate.name || '');
    setNewMemEmail(candidate.email || '');
    setNewMemSrn(candidate.srn || '');
    setNewMemBranch(candidate.branch || 'School of C&IT');
    setNewMemPhone(candidate.phone || '');
    if (candidate.preferredWing) setNewMemWing(candidate.preferredWing);
    if (candidate.roleSuggested) setNewMemRole(candidate.roleSuggested);
    if (candidate.avatar) setNewMemAvatar(candidate.avatar);
    setCandidateSearchQuery('');
    showToast(`Pre-filled details for ${candidate.name}!`, 'info');
  };

  // Handle local device photo upload in registration modal
  const handleRegisterAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMemAvatar(reader.result);
        showToast('Photo uploaded from local device!', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Add Member submit
  const handleRegisterMemberSubmit = (e) => {
    e.preventDefault();
    if (!newMemName.trim() || !newMemSrn.trim()) {
      showToast('Name and SRN are mandatory.', 'error');
      return;
    }

    if (!newMemPhone.trim() || newMemPhone.trim().replace(/\D/g, '').length < 10) {
      showToast('A valid 10-digit mobile number is strictly mandatory.', 'error');
      return;
    }

    addClubMember({
      name: newMemName.trim(),
      email: newMemEmail.trim().toLowerCase() || `${newMemSrn.trim().toLowerCase()}@reva.edu.in`,
      srn: newMemSrn.trim().toUpperCase(),
      branch: newMemBranch.trim(),
      wing: newMemWing,
      role: newMemRole.trim() || 'Club Member',
      phone: newMemPhone.trim(),
      avatar: newMemAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newMemName.trim()}`,
      points: 200,
      overallScore: 80,
      flags: 3
    });

    setShowAddMemberModal(false);
    setNewMemName('');
    setNewMemEmail('');
    setNewMemSrn('');
    setNewMemPhone('');
    setNewMemAvatar(null);
  };

  // Filtered & Sorted Members
  const filteredMembers = useMemo(() => {
    let list = [...clubMembers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => 
        m.name?.toLowerCase().includes(q) ||
        m.srn?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q) ||
        m.wing?.toLowerCase().includes(q) ||
        m.branch?.toLowerCase().includes(q)
      );
    }

    if (wingFilter !== 'ALL') {
      list = list.filter(m => m.wing?.toUpperCase().includes(wingFilter.toUpperCase()));
    }

    if (statusFilter !== 'ALL') {
      list = list.filter(m => (m.status || 'active').toLowerCase() === statusFilter.toLowerCase());
    }

    list.sort((a, b) => {
      if (sortBy === 'score') return (b.overallScore || 0) - (a.overallScore || 0);
      if (sortBy === 'points') return (b.points || 0) - (a.points || 0);
      if (sortBy === 'hours') return (b.hoursWorked || 0) - (a.hoursWorked || 0);
      if (sortBy === 'stars') return (b.stars || 0) - (a.stars || 0);
      return 0;
    });

    return list;
  }, [clubMembers, searchQuery, wingFilter, statusFilter, sortBy]);

  // Counts for status tabs
  const activeCount = clubMembers.filter(m => (m.status || 'active') === 'active').length;
  const warningCount = clubMembers.filter(m => m.status === 'warning').length;
  const firedCount = clubMembers.filter(m => m.status === 'fired').length;

  return (
    <section id="club-management" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Section Title Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>5 Specialized Wings • Club ORION Governance</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-100 font-display">
              Member Operations & <span className="gold-glow text-amber-400">Performance Hub</span>
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Real-time points, 3-flag disciplinary records, star honors, duty hour tracking, and dynamic candidate onboarding across all 5 wings.
            </p>
          </div>

          {/* Action Bar (Top Right) */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {canManageMembers && (
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Register New Member</span>
              </button>
            )}

            {/* View Mode Switcher */}
            {isMember && (
              <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="Clean Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* UNREGISTERED / VISITOR PORTAL BANNER */}
        {isVisitor && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#101216] to-[#0a0b0e] border border-amber-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Club Members Standing & Leaderboard
              </h3>
              <p className="text-sm text-slate-300">
                Performance leaderboards, points tally, star honors, and activity standings are available to registered Club ORION members and wing teams at REVA University.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-950/40 hover:scale-105 transition-all flex items-center justify-center gap-2.5 border border-[#0078d4]/50"
              >
                <MicrosoftLogo className="w-4 h-4" />
                <span>Sign In with Microsoft 365 (@reva.edu.in)</span>
              </button>

              <a
                href="#recruitment"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all"
              >
                Apply via Recruitment 2026
              </a>
            </div>
          </motion.div>
        )}

        {/* ACTIVE MEMBER & WING TEAM DASHBOARD */}
        {isMember && (
          <div className="space-y-6">

            {/* Personal Standing Card */}
            {personalRecord && (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#121418] via-[#0d0e11] to-[#0b0c0f] border border-amber-500/40 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <div className="relative">
                    <img
                      src={personalRecord.avatar}
                      alt={personalRecord.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md shadow-amber-500/20"
                    />
                    <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.5 rounded-full">
                      {personalRecord.stars || 0}★
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-white font-display">
                        {personalRecord.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {personalRecord.wing}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {personalRecord.role} • <span className="font-mono text-cyan-400">{personalRecord.srn}</span> • {personalRecord.branch}
                    </p>
                  </div>
                </div>

                {/* 4 Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Points</span>
                    <span className="text-xl font-extrabold text-amber-400 font-mono">{personalRecord.points || 0}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Score</span>
                    <span className="text-xl font-extrabold text-cyan-400 font-mono">{personalRecord.overallScore || 80}%</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">3-Flag Status</span>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      {[1, 2, 3].map((f) => (
                        <span key={f} className={`text-base ${f <= (personalRecord.flags || 3) ? 'opacity-100 scale-110' : 'opacity-20 grayscale'}`}>
                          🚩
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Duty Hours</span>
                    <span className="text-xl font-extrabold text-emerald-400 font-mono">{personalRecord.hoursWorked || 0}h</span>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Pills & Search Bar Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              
              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${statusFilter === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-950/60'}`}
                >
                  All ({clubMembers.length})
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${statusFilter === 'active' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20'}`}
                >
                  <span>Active (3 Flags)</span>
                  <span className="px-1.5 py-0.2 bg-emerald-950/80 text-[10px] rounded-full text-emerald-300">{activeCount}</span>
                </button>
                <button
                  onClick={() => setStatusFilter('warning')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${statusFilter === 'warning' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20'}`}
                >
                  <span>On Warning (1-2 Flags)</span>
                  <span className="px-1.5 py-0.2 bg-amber-950/80 text-[10px] rounded-full text-amber-300">{warningCount}</span>
                </button>
                <button
                  onClick={() => setStatusFilter('fired')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${statusFilter === 'fired' ? 'bg-rose-500 text-white font-bold' : 'text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20'}`}
                >
                  <span>Fired (0 Flags)</span>
                  <span className="px-1.5 py-0.2 bg-rose-950/80 text-[10px] rounded-full text-rose-300">{firedCount}</span>
                </button>
              </div>

              {/* Search & Wing Select */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 md:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, SRN, role..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-amber-400"
                  />
                </div>

                <select
                  value={wingFilter}
                  onChange={(e) => setWingFilter(e.target.value)}
                  className="px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none"
                >
                  <option value="ALL">All 5 Wings</option>
                  {WING_OPTIONS_LIST.map(w => <option key={w} value={w}>{w}</option>)}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none"
                >
                  <option value="score">Sort: Score</option>
                  <option value="points">Sort: Points</option>
                  <option value="hours">Sort: Hours</option>
                  <option value="stars">Sort: Stars</option>
                </select>
              </div>
            </div>

            {/* ============================================================ */}
            {/* VIEW MODE 1: CARD GRID VIEW (Modern, Spacious, Decluttered) */}
            {/* ============================================================ */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMembers.map((member) => {
                  const isFired = member.status === 'fired' || member.flags === 0;
                  const isWarning = member.status === 'warning' || (member.flags > 0 && member.flags < 3);

                  return (
                    <motion.div
                      key={member.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-5 rounded-3xl border transition-all relative flex flex-col justify-between ${
                        isFired
                          ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/20'
                          : isWarning
                            ? 'bg-[#121317] border-amber-500/40 shadow-lg shadow-amber-950/10'
                            : 'bg-[#0d0e11] border-slate-800 hover:border-slate-700 shadow-md'
                      }`}
                    >
                      {/* Top Row: Avatar, Identity & Status Badge */}
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className={`w-12 h-12 rounded-2xl object-cover border-2 shrink-0 ${
                                isFired ? 'border-rose-500 grayscale' : isWarning ? 'border-amber-400' : 'border-slate-700'
                              }`}
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-base text-white font-display leading-tight">
                                  {member.name}
                                </h4>
                                {member.stars > 0 && (
                                  <span className="text-xs text-amber-400" title={`${member.stars} Stars`}>
                                    {'⭐'.repeat(Math.min(member.stars, 5))}
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[11px] text-cyan-400 block">{member.srn}</span>
                              <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">{member.role}</span>
                            </div>
                          </div>

                          {/* Status Pill */}
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                            isFired
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : isWarning
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {isFired ? 'FIRED' : isWarning ? 'WARNING' : 'ACTIVE'}
                          </span>
                        </div>

                        {/* Wing & Branch Pill */}
                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                          <span className="font-semibold text-amber-300/90">{member.wing}</span>
                          <span className="truncate max-w-[150px]">{member.branch}</span>
                        </div>

                        {/* Metrics Bar */}
                        <div className="grid grid-cols-4 gap-2 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800/80 text-center">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block font-semibold">Points</span>
                            <span className="font-mono font-bold text-amber-400 text-xs">{member.points || 0}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block font-semibold">Score</span>
                            <span className="font-mono font-bold text-cyan-400 text-xs">{member.overallScore || 80}%</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block font-semibold">3-Flags</span>
                            <div className="flex items-center justify-center gap-0.5 text-xs mt-0.5">
                              {[1, 2, 3].map((f) => (
                                <span key={f} className={f <= (member.flags || 3) ? 'opacity-100' : 'opacity-20 grayscale'}>
                                  🚩
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block font-semibold">Hours</span>
                            <span className="font-mono font-bold text-emerald-400 text-xs">{member.hoursWorked || 0}h</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedMemberModal(member)}
                          className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View History</span>
                        </button>

                        {canManageMembers ? (
                          <button
                            onClick={() => openManageModal(member)}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Manage</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Discipline Governed</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW MODE 2: CLEAN TABLE VIEW */}
            {/* ============================================================ */}
            {viewMode === 'table' && (
              <div className="rounded-3xl border border-slate-800 bg-[#0d0e11] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">Member & SRN</th>
                        <th className="px-4 py-3.5">Wing & Role</th>
                        <th className="px-3 py-3.5 text-center">Score</th>
                        <th className="px-3 py-3.5 text-center">Points</th>
                        <th className="px-3 py-3.5 text-center">3-Flag Health</th>
                        <th className="px-3 py-3.5 text-center">Stars</th>
                        <th className="px-3 py-3.5 text-center">Hours</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredMembers.map((member) => {
                        const isFired = member.status === 'fired' || member.flags === 0;

                        return (
                          <tr key={member.id} className={`hover:bg-slate-800/40 transition-colors ${isFired ? 'bg-rose-950/10' : ''}`}>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-xl object-cover border border-slate-700" />
                                <div>
                                  <span className="font-bold text-white block">{member.name}</span>
                                  <span className="font-mono text-[10px] text-cyan-400">{member.srn}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-amber-400 font-semibold block">{member.wing}</span>
                              <span className="text-slate-400 text-[11px] block">{member.role}</span>
                            </td>
                            <td className="px-3 py-3 text-center font-mono font-bold text-cyan-400">
                              {member.overallScore || 80}%
                            </td>
                            <td className="px-3 py-3 text-center font-mono font-bold text-amber-400">
                              {member.points || 0}
                            </td>
                            <td className="px-3 py-3 text-center">
                              <div className="flex items-center justify-center gap-0.5 text-xs">
                                {[1, 2, 3].map((f) => (
                                  <span key={f} className={f <= (member.flags || 3) ? 'opacity-100' : 'opacity-20 grayscale'}>
                                    🚩
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center text-amber-400 font-bold">
                              {member.stars ? `⭐ ${member.stars}` : '—'}
                            </td>
                            <td className="px-3 py-3 text-center font-mono text-emerald-400 font-bold">
                              {member.hoursWorked || 0}h
                            </td>
                            <td className="px-5 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedMemberModal(member)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                  title="View History & Duty Logs"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {canManageMembers && (
                                  <button
                                    onClick={() => openManageModal(member)}
                                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                                  >
                                    Manage
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ============================================================ */}
        {/* COMPREHENSIVE "MANAGE MEMBER" MULTI-TAB MODAL */}
        {/* ============================================================ */}
        <AnimatePresence>
          {manageMemberModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0d0e11] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={manageMemberModal.avatar}
                      alt={manageMemberModal.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white font-display">
                        Manage: {manageMemberModal.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {manageMemberModal.role} • <span className="text-amber-400 font-semibold">{manageMemberModal.wing}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setManageMemberModal(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto">
                  <button
                    onClick={() => setManageTab('points')}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${manageTab === 'points' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    🏆 Points & Score
                  </button>
                  <button
                    onClick={() => setManageTab('flags')}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${manageTab === 'flags' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    🚩 3-Flag System
                  </button>
                  <button
                    onClick={() => setManageTab('stars')}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${manageTab === 'stars' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    ⭐ Stars
                  </button>
                  <button
                    onClick={() => setManageTab('hours')}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${manageTab === 'hours' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    ⏱️ Duty Hours
                  </button>
                  <button
                    onClick={() => setManageTab('position')}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${manageTab === 'position' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    👑 Position
                  </button>
                </div>

                {/* TAB 1: POINTS & SCORE */}
                {manageTab === 'points' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block">Current Balance</span>
                        <span className="text-2xl font-bold font-mono text-amber-400">{manageMemberModal.points || 0} pts</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Current Score</span>
                        <span className="text-2xl font-bold font-mono text-cyan-400">{manageMemberModal.overallScore || 80}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-semibold text-slate-300 block">Quick Points Adjustments</label>
                      <div className="grid grid-cols-5 gap-2">
                        {[-50, -25, 50, 100, 200].map((delta) => (
                          <button
                            key={delta}
                            type="button"
                            onClick={() => updateMemberPoints(manageMemberModal.id, delta, 'Quick Adjustment')}
                            className={`py-2 rounded-xl font-bold text-xs transition-colors ${
                              delta > 0
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                            }`}
                          >
                            {delta > 0 ? `+${delta}` : delta}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <label className="font-semibold text-slate-300 block">Custom Points Modifier</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="e.g. 75 or -30"
                          value={customPointsInput}
                          onChange={(e) => setCustomPointsInput(e.target.value)}
                          className="w-32 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Reason (e.g. Fest Coordination bonus)"
                          value={customPointsReason}
                          onChange={(e) => setCustomPointsReason(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const p = parseInt(customPointsInput, 10);
                            if (!isNaN(p) && p !== 0) {
                              updateMemberPoints(manageMemberModal.id, p, customPointsReason || 'Administrative Note');
                              setCustomPointsInput('');
                              setCustomPointsReason('');
                            }
                          }}
                          className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <label className="font-semibold text-slate-300 block">Direct Performance Score % (0-100)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={customScoreInput}
                          onChange={(e) => setCustomScoreInput(parseInt(e.target.value, 10))}
                          className="flex-1 accent-cyan-400"
                        />
                        <span className="font-mono font-bold text-cyan-400 text-sm w-12">{customScoreInput}%</span>
                        <button
                          type="button"
                          onClick={() => updateMemberScore(manageMemberModal.id, customScoreInput)}
                          className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold hover:bg-cyan-500/30"
                        >
                          Update Score
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: 3-FLAG DISCIPLINARY SYSTEM */}
                {manageTab === 'flags' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-center">
                      <span className="text-slate-400 text-xs block font-semibold uppercase tracking-wider">Active 3-Flag Disciplinary Health</span>
                      <div className="flex items-center justify-center gap-2 text-3xl">
                        {[1, 2, 3].map((f) => (
                          <span key={f} className={f <= (manageMemberModal.flags || 3) ? 'opacity-100 scale-110' : 'opacity-20 grayscale'}>
                            🚩
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Each flag removed is a warning strike. If all 3 flags are removed, the member is automatically <span className="text-rose-400 font-bold">FIRED</span>.
                      </p>
                    </div>

                    {/* Fired vs Active Actions */}
                    {manageMemberModal.status === 'fired' || manageMemberModal.flags === 0 ? (
                      <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 space-y-3">
                        <div className="flex items-center gap-2 text-rose-300 font-bold">
                          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                          <span>MEMBER IS CURRENTLY FIRED</span>
                        </div>
                        <p className="text-xs text-rose-200/80">
                          All 3 disciplinary flags have been exhausted. Member is dismissed from active duties.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            rehireMember(manageMemberModal.id);
                            setManageMemberModal({ ...manageMemberModal, status: 'active', flags: 3 });
                          }}
                          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Re-Hire & Reinstate Member (3/3 Flags)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Issue Warning Strike Button */}
                        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                          <label className="font-semibold text-rose-400 block">Issue Warning Strike (Remove 1 Flag)</label>
                          <input
                            type="text"
                            placeholder="Reason (e.g. Unexcused absence from event duty)"
                            value={warningReason}
                            onChange={(e) => setWarningReason(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!warningReason.trim()) {
                                showToast('Please provide a reason for the warning strike.', 'error');
                                return;
                              }
                              removeMemberFlag(manageMemberModal.id, warningReason);
                              setWarningReason('');
                              setManageMemberModal({
                                ...manageMemberModal,
                                flags: Math.max(0, (manageMemberModal.flags || 3) - 1),
                                status: (manageMemberModal.flags - 1 === 0) ? 'fired' : 'warning'
                              });
                            }}
                            className="w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                          >
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                            <span>Remove 1 Flag (Issue Strike)</span>
                          </button>
                        </div>

                        {/* Renew Flags Button */}
                        {manageMemberModal.flags < 3 && (
                          <button
                            type="button"
                            onClick={() => {
                              renewMemberFlags(manageMemberModal.id);
                              setManageMemberModal({ ...manageMemberModal, flags: 3, status: 'active' });
                            }}
                            className="w-full py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Renew Flags (Clear Slate back to 3/3)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: STARS & HONORS */}
                {manageTab === 'stars' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-2">
                      <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider block">Total Stars Awarded</span>
                      <div className="text-3xl text-amber-400 font-bold flex items-center justify-center gap-1">
                        <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
                        <span>{manageMemberModal.stars || 0}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Stars are bestowed upon members who display exceptional teamwork, leadership, or technical feats.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="font-semibold text-slate-300 block">Citation / Award Category</label>
                      <select
                        value={starCitation}
                        onChange={(e) => setStarCitation(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                      >
                        <option value="Star of the Month">Star of the Month</option>
                        <option value="Outstanding Leadership Excellence">Outstanding Leadership Excellence</option>
                        <option value="Technical Product Feat">Technical Product Feat</option>
                        <option value="Cultural Fest Showstopper">Cultural Fest Showstopper</option>
                        <option value="Zero-Delay Ground Logistics">Zero-Delay Ground Logistics</option>
                        <option value="Exceptional Media & PR Campaign">Exceptional Media & PR Campaign</option>
                      </select>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            awardMemberStar(manageMemberModal.id, starCitation);
                            setManageMemberModal({
                              ...manageMemberModal,
                              stars: (manageMemberModal.stars || 0) + 1,
                              points: (manageMemberModal.points || 0) + 100
                            });
                          }}
                          className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow flex items-center justify-center gap-1.5"
                        >
                          <Star className="w-4 h-4 fill-slate-950" />
                          <span>Award Star (+100 pts)</span>
                        </button>

                        <button
                          type="button"
                          disabled={!manageMemberModal.stars || manageMemberModal.stars <= 0}
                          onClick={() => {
                            revokeMemberStar(manageMemberModal.id);
                            setManageMemberModal({
                              ...manageMemberModal,
                              stars: Math.max(0, (manageMemberModal.stars || 0) - 1)
                            });
                          }}
                          className="py-2.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 font-semibold rounded-xl disabled:opacity-30 disabled:pointer-events-none"
                        >
                          Revoke 1 Star
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: WORK DUTY TIMINGS */}
                {manageTab === 'hours' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-1">
                      <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider block">Cumulative Work Hours</span>
                      <span className="text-3xl font-extrabold font-mono text-emerald-400">{manageMemberModal.hoursWorked || 0} hrs</span>
                    </div>

                    <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                      <label className="font-semibold text-emerald-400 block">Log New Work Duty Hours</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 text-[10px] mb-1">Hours Worked</label>
                          <input
                            type="number"
                            step="0.5"
                            placeholder="e.g. 3.5"
                            value={logHours}
                            onChange={(e) => setLogHours(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-[10px] mb-1">Category</label>
                          <select
                            value={logCategory}
                            onChange={(e) => setLogCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 outline-none"
                          >
                            <option value="Event Duty">Event Duty</option>
                            <option value="Stage Logistics">Stage Logistics</option>
                            <option value="Tech Development">Tech Development</option>
                            <option value="Cultural Rehearsal">Cultural Rehearsal</option>
                            <option value="Media & Coverage">Media & Coverage</option>
                            <option value="Marketing & Outreach">Marketing & Outreach</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[10px] mb-1">Task Description</label>
                        <input
                          type="text"
                          placeholder="e.g. Stage sound calibration & crowd management"
                          value={logTask}
                          onChange={(e) => setLogTask(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const h = parseFloat(logHours);
                          if (h > 0 && logTask.trim()) {
                            logMemberWorkHours(manageMemberModal.id, h, logTask, logCategory);
                            setManageMemberModal({
                              ...manageMemberModal,
                              hoursWorked: (manageMemberModal.hoursWorked || 0) + h
                            });
                            setLogHours('');
                            setLogTask('');
                          } else {
                            showToast('Please specify valid hours and task description.', 'error');
                          }
                        }}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Log Hours & Award Points</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 5: POSITION & CREDENTIALS */}
                {manageTab === 'position' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Position / Role Title</label>
                      <input
                        type="text"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        placeholder="e.g. Lead, Secretary, Co-Lead"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Assigned Wing</label>
                        <select
                          value={editWing}
                          onChange={(e) => setEditWing(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                        >
                          {WING_OPTIONS_LIST.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">School / Branch</label>
                        <input
                          type="text"
                          value={editBranch}
                          onChange={(e) => setEditBranch(e.target.value)}
                          placeholder="School of C&IT"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${manageMemberModal.name} from the club roster?`)) {
                            deleteClubMember(manageMemberModal.id);
                            setManageMemberModal(null);
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Member</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateMemberPosition(manageMemberModal.id, {
                            role: editRole,
                            wing: editWing,
                            branch: editBranch
                          });
                          setManageMemberModal({
                            ...manageMemberModal,
                            role: editRole,
                            wing: editWing,
                            branch: editBranch
                          });
                        }}
                        className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 shadow"
                      >
                        Save Role & Wing
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* MODAL: REGISTER NEW MEMBER WITH DYNAMIC KEYWORD SEARCH */}
        {/* ============================================================ */}
        <AnimatePresence>
          {showAddMemberModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0d0e11] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white font-display">
                      Register Member into Club Roster
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      New members automatically receive 3 active flags and welcome points.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddMemberModal(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* DYNAMIC KEYWORD SEARCH BAR (Image 2 Fix) */}
                <div className="p-3 bg-slate-900 rounded-2xl border border-amber-500/30 space-y-2">
                  <label className="block text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dynamic Keyword Search (Registered Students & Applicants)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={candidateSearchQuery}
                      onChange={(e) => setCandidateSearchQuery(e.target.value)}
                      placeholder="Type student name, SRN, or email to auto-fill..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Autocomplete Suggestions Dropdown */}
                  {candidateSuggestions.length > 0 && (
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1 pt-1">
                      <span className="text-[10px] text-slate-400 block">Click to 1-Click Auto-Fill:</span>
                      {candidateSuggestions.map((cand) => (
                        <div
                          key={cand.id}
                          onClick={() => handleSelectCandidate(cand)}
                          className="p-2 rounded-xl bg-slate-950 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/40 text-xs flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-200 block">{cand.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{cand.srn} • {cand.branch}</span>
                          </div>
                          <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md">
                            Select
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Manual Registration Form */}
                <form onSubmit={handleRegisterMemberSubmit} className="space-y-3 text-xs">
                  
                  {/* Photo Upload from Local Device */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Member Profile Photo (Direct Device Upload)
                    </label>
                    <div className="flex items-center gap-3 p-2 bg-slate-950 border border-slate-700 rounded-xl">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-600 shrink-0 flex items-center justify-center">
                        {newMemAvatar ? (
                          <img src={newMemAvatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <label className="flex-1 cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 border border-slate-600 transition-colors flex items-center justify-center gap-2">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>{newMemAvatar ? 'Change Photo' : 'Upload from Device'}</span>
                        <input type="file" accept="image/*" onChange={handleRegisterAvatarUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Full Student Name *</label>
                    <input
                      type="text"
                      required
                      value={newMemName}
                      onChange={(e) => setNewMemName(e.target.value)}
                      placeholder="e.g. Tanmay Bhatt"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Student SRN *</label>
                    <input
                      type="text"
                      required
                      value={newMemSrn}
                      onChange={(e) => setNewMemSrn(e.target.value)}
                      placeholder="e.g. R23MJ044"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 uppercase outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">REVA Student Email *</label>
                    <input
                      type="email"
                      required
                      value={newMemEmail}
                      onChange={(e) => setNewMemEmail(e.target.value)}
                      placeholder="tanmay.b@reva.edu.in"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Mobile / WhatsApp Number * (Mandatory)</label>
                    <input
                      type="tel"
                      required
                      value={newMemPhone}
                      onChange={(e) => setNewMemPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Assigned Wing</label>
                      <select
                        value={newMemWing}
                        onChange={(e) => setNewMemWing(e.target.value)}
                        className="w-full px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                      >
                        {WING_OPTIONS_LIST.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Position / Role</label>
                      <input
                        type="text"
                        value={newMemRole}
                        onChange={(e) => setNewMemRole(e.target.value)}
                        placeholder="e.g. Member, Lead"
                        className="w-full px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">School / Branch</label>
                    <input
                      type="text"
                      value={newMemBranch}
                      onChange={(e) => setNewMemBranch(e.target.value)}
                      placeholder="School of C&IT"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddMemberModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg transition-colors"
                    >
                      Register Member
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* MODAL: INSPECT MEMBER PROFILE & DUTY LOGS */}
        {/* ============================================================ */}
        <AnimatePresence>
          {selectedMemberModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0d0e11] border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5 text-slate-100 max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedMemberModal.avatar}
                      alt={selectedMemberModal.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white font-display">
                        {selectedMemberModal.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {selectedMemberModal.role} • <span className="font-mono text-cyan-400">{selectedMemberModal.srn}</span>
                      </p>
                      <span className="text-[11px] font-bold text-amber-400">{selectedMemberModal.wing}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMemberModal(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 4 Stats */}
                <div className="grid grid-cols-4 gap-2 text-center bg-slate-900 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold block">Points</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">{selectedMemberModal.points || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold block">Score</span>
                    <span className="font-mono font-bold text-cyan-400 text-sm">{selectedMemberModal.overallScore || 80}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold block">Flags</span>
                    <span className="font-bold text-sm">{selectedMemberModal.flags || 3}/3 🚩</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold block">Hours</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{selectedMemberModal.hoursWorked || 0}h</span>
                  </div>
                </div>

                {/* Disciplinary Flag History */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Disciplinary & Flag Records</span>
                  </h4>
                  {selectedMemberModal.flagHistory && selectedMemberModal.flagHistory.length > 0 ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {selectedMemberModal.flagHistory.map((hist, hIdx) => (
                        <div key={hIdx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between gap-2">
                          <div>
                            <span className="text-rose-200 font-medium block">{hist.reason}</span>
                            <span className="text-[10px] text-slate-500">{hist.date} • {hist.issuedBy}</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {hist.flagsRemaining} flags left
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                      Clean disciplinary record. Full 3 active flags in good standing.
                    </p>
                  )}
                </div>

                {/* Duty Hours Log */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Work Hours & Duty Logs ({selectedMemberModal.hoursWorked || 0}h Total)</span>
                  </h4>
                  {selectedMemberModal.timingLogs && selectedMemberModal.timingLogs.length > 0 ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {selectedMemberModal.timingLogs.map((log, lIdx) => (
                        <div key={lIdx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between gap-2">
                          <div>
                            <span className="text-slate-200 font-medium block">{log.task}</span>
                            <span className="text-[10px] text-slate-500">{log.date} • {log.category || 'General'}</span>
                          </div>
                          <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            +{log.hours}h
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                      No duty timings logged yet.
                    </p>
                  )}
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
