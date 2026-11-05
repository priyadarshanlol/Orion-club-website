import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import AuditionSlotPicker from './AuditionSlotPicker';
import ApplicationStatus from './ApplicationStatus';
import confetti from 'canvas-confetti';
import { ShieldCheck, LogIn, Sparkles, Send, User, BookOpen, Layers, CheckCircle2, AlertCircle, ArrowRight, Award, Lock, Phone, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const WING_CHOICES = [
  { id: 'discipline', label: '01 - Discipline Wing' },
  { id: 'internal-external', label: '02 - Internal & External Wing' },
  { id: 'cultural', label: '03 - Cultural Wing' },
  { id: 'technical', label: '04 - Technical Wing' },
  { id: 'media', label: '05 - Media & Marketing Wing (Media Coverage & PR)' }
];

export default function RecruitmentPortal() {
  const { currentUser, loginWithMicrosoft } = useAuth();
  const { applicationsMap, submitApplication, auditionSlots, showToast } = useData();

  // Check if current user has already submitted
  const userApplication = currentUser ? applicationsMap[currentUser.uid] : null;

  // Form State
  const [candidateName, setCandidateName] = useState(currentUser?.displayName || '');
  const [candidateEmail, setCandidateEmail] = useState(currentUser?.email || '');
  const [srn, setSrn] = useState(currentUser?.srn || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [branch, setBranch] = useState(currentUser?.branch || 'School of C&IT');
  const [semester, setSemester] = useState('3rd Semester (2nd Year)');
  const [primaryWing, setPrimaryWing] = useState('discipline');
  const [secondaryWing, setSecondaryWing] = useState('cultural');
  const [roleApplied, setRoleApplied] = useState('Core Member');
  const [sop, setSop] = useState('');
  const [experience, setExperience] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [auditionSlotId, setAuditionSlotId] = useState('slot-a');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const branchOptions = [
    'School of C&IT (Computer & Information Tech)',
    'School of Computer Science & Engineering',
    'School of Electronics & Communication (ECE)',
    'School of Electrical & Electronics (EEE)',
    'School of Mechanical Engineering',
    'School of Civil Engineering',
    'School of Architecture & Planning',
    'School of Management Studies',
    'School of Arts, Humanities & Social Sciences',
    'School of Applied Sciences'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please sign in with your REVA Microsoft student account first.', 'error');
      return;
    }

    if (!srn.trim()) {
      showToast('Please enter your official REVA SRN / Roll Number.', 'error');
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      showToast('A valid 10-digit mobile number is strictly mandatory.', 'error');
      return;
    }

    if (primaryWing === secondaryWing) {
      showToast('Primary and Secondary Wing preferences must be different.', 'error');
      return;
    }

    if (!auditionSlotId) {
      showToast('Please select a valid Audition Slot.', 'error');
      return;
    }

    if (!sop.trim() || sop.length < 20) {
      showToast('Please write a brief Statement of Purpose (min 20 characters).', 'error');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: candidateName.trim() || currentUser.displayName,
      email: candidateEmail.trim() || currentUser.email,
      phone: phone.trim(),
      srn: srn.trim().toUpperCase(),
      branch,
      semester,
      primaryWing,
      secondaryWing,
      roleApplied,
      sop: sop.trim(),
      experience: experience.trim(),
      portfolioUrl: portfolioUrl.trim(),
      githubUrl: githubUrl.trim(),
      auditionSlotId
    };

    const res = await submitApplication(currentUser.uid, payload);
    setIsSubmitting(false);

    if (res.success) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#06b6d4', '#8b5cf6', '#ffffff']
      });
    }
  };

  return (
    <section id="recruitment" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recruitment & Auditions 2026 • 5 Specialized Wings</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-100 leading-tight">
            Join the <span className="heading-accent">ORION</span> Constellation
          </h2>

          <p className="text-sm sm:text-base text-slate-400">
            Open strictly to REVA University students. Complete your profile, select your preferred wing domains, and reserve your real-time audition slot.
          </p>
        </div>

        {/* AUTH GATE CHECK */}
        {!currentUser ? (
          <div className="glass-panel rounded-3xl p-8 text-center max-w-2xl mx-auto space-y-6 border border-cyan-500/30 shadow-2xl bg-gradient-to-b from-[#101216]/90 to-[#0c0d10]">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-100 font-display">
                REVA Student Portal Authentication
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                Authentication is strictly restricted to official <code className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono">@reva.edu.in</code> student accounts.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => loginWithMicrosoft()}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/25 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 fill-slate-950" viewBox="0 0 23 23">
                  <path d="M0 0h11v11H0zM12 0h11v11H12zM0 12h11v11H0zM12 12h11v11H12z"/>
                </svg>
                <span>Sign In with REVA Microsoft SSO</span>
              </button>
            </div>
          </div>
        ) : userApplication ? (
          /* APPLICANT DASHBOARD TRACKER */
          <ApplicationStatus application={userApplication} currentUser={currentUser} />
        ) : (
          /* MULTI-STEP RECRUITMENT APPLICATION FORM */
          <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-10 border border-amber-500/30 space-y-8 bg-gradient-to-b from-[#101216]/90 via-[#0c0d10] to-[#0c0d10] shadow-2xl">
            
            {/* Admin Notice Banner (If viewing as Admin) */}
            {currentUser?.isAdmin && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  Signed in as Administrator: <strong>{currentUser.displayName}</strong>. You are previewing the recruitment audition application form. Submitted forms register as candidate applications for wing directors to review.
                </span>
              </div>
            )}

            {/* User Profile Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20">
              <div className="flex items-center gap-3">
                <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover" />
                <div>
                  <div className="text-base font-bold text-slate-100">{currentUser.displayName}</div>
                  <div className="text-xs text-amber-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {currentUser.email}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 uppercase tracking-wider">
                REVA Student Candidate
              </span>
            </div>

            {/* STEP 1: Academic & Contact Profile */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs font-display">1</span>
                <h3 className="text-lg font-bold text-slate-100 font-display">Academic Profile Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Candidate Name *</label>
                  <input
                    type="text"
                    required
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Candidate full name"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">REVA Student Email *</label>
                  <input
                    type="email"
                    required
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="srn@reva.edu.in"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">REVA SRN / Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. R23CS112"
                    value={srn}
                    onChange={(e) => setSrn(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 uppercase outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile / WhatsApp * (Mandatory)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 pl-9 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-amber-400"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Semester & Year *</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-amber-400"
                  >
                    <option value="1st Semester (1st Year)">1st Semester (1st Year)</option>
                    <option value="2nd Semester (1st Year)">2nd Semester (1st Year)</option>
                    <option value="3rd Semester (2nd Year)">3rd Semester (2nd Year) — Recommended</option>
                    <option value="4th Semester (2nd Year)">4th Semester (2nd Year)</option>
                    <option value="5th Semester (3rd Year)">5th Semester (3rd Year)</option>
                    <option value="6th Semester (3rd Year)">6th Semester (3rd Year)</option>
                    <option value="7th Semester (4th Year)">7th Semester (4th Year)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">School / Branch *</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-amber-400"
                >
                  {branchOptions.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* STEP 2: 5 Wings & Role Preference */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 font-bold flex items-center justify-center text-xs font-display">2</span>
                <h3 className="text-lg font-bold text-slate-100 font-display">Wing & Role Preference</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Wing Choice *</label>
                  <select
                    value={primaryWing}
                    onChange={(e) => setPrimaryWing(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-amber-500/40 rounded-xl text-xs text-amber-300 outline-none font-medium"
                  >
                    {WING_CHOICES.map(w => (
                      <option key={w.id} value={w.id}>{w.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Secondary Wing Choice *</label>
                  <select
                    value={secondaryWing}
                    onChange={(e) => setSecondaryWing(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none"
                  >
                    {WING_CHOICES.map(w => (
                      <option key={w.id} value={w.id}>{w.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role Preference</label>
                  <select
                    value={roleApplied}
                    onChange={(e) => setRoleApplied(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none"
                  >
                    <option value="Core Member">Core Member</option>
                    <option value="Wing Associate">Wing Associate</option>
                    <option value="Technical Contributor">Technical Contributor</option>
                    <option value="Cultural Performer">Cultural Performer</option>
                    <option value="Event Coordinator">Event Coordinator</option>
                    <option value="Media Creator">Media Creator</option>
                  </select>
                </div>
              </div>
            </div>

            {/* STEP 3: Questionnaire */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <span className="w-6 h-6 rounded-full bg-purple-400 text-slate-950 font-bold flex items-center justify-center text-xs font-display">3</span>
                <h3 className="text-lg font-bold text-slate-100 font-display">Questionnaire & Portfolio</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Statement of Purpose (SOP) — Why do you want to join Club ORION? *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe your motivation, unique strengths, and how you can contribute to your selected wing..."
                  value={sop}
                  onChange={(e) => setSop(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub / Portfolio Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://github.com/yourhandle or portfolio"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Past Experience / Key Skills (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Stage Coordination, Videography"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* STEP 4: Audition Slot Reservation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 font-bold flex items-center justify-center text-xs font-display">4</span>
                <h3 className="text-lg font-bold text-slate-100 font-display">Audition Slot Reservation</h3>
              </div>

              <AuditionSlotPicker
                slots={auditionSlots}
                selectedSlotId={auditionSlotId}
                onSelectSlot={(slotId) => setAuditionSlotId(slotId)}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 flex items-center justify-end border-t border-slate-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 font-extrabold text-slate-950 rounded-2xl text-base shadow-xl shadow-amber-500/25 hover:from-amber-300 hover:to-amber-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Reserving Audition Slot...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Recruitment Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
