import React from 'react';
import { useData } from '../context/DataContext';
import { CheckCircle2, Clock, Calendar, ShieldCheck, Sparkles, FileText, UserCheck, Layers } from 'lucide-react';

export default function ApplicationStatus({ application, currentUser }) {
  const { updateApplicationStatus } = useData();

  if (!application) return null;

  const steps = [
    { key: 'Submitted', label: 'Application Submitted', desc: 'Received & logged in Firestore' },
    { key: 'Shortlisted', label: 'Domain Shortlisted', desc: 'Reviewed by Wing Leads' },
    { key: 'Slot Confirmed', label: 'Audition Slot Confirmed', desc: 'Ready for campus offline audition' },
  ];

  const getCurrentStepIndex = () => {
    switch (application.status) {
      case 'Slot Confirmed': return 2;
      case 'Shortlisted': return 1;
      default: return 0;
    }
  };

  const activeIndex = getCurrentStepIndex();

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/30 space-y-8 bg-gradient-to-b from-[#0c0d10]/90 via-[#101216]/80 to-[#0c0d10]/90 shadow-2xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100 font-display">
                Application Received!
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                {application.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Candidate SRN: <span className="text-slate-200 font-semibold">{application.srn}</span> • Submitted: {new Date(application.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Demo Status Change Controls */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 px-2 text-[11px]">Demo Progress Simulator:</span>
          <button
            onClick={() => updateApplicationStatus(currentUser.uid, 'Shortlisted')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${application.status === 'Shortlisted' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            Shortlist
          </button>
          <button
            onClick={() => updateApplicationStatus(currentUser.uid, 'Slot Confirmed')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${application.status === 'Slot Confirmed' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            Confirm Slot
          </button>
        </div>
      </div>

      {/* Real-Time Progress Steps Timeline */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recruitment Pipeline Progress</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, idx) => {
            const isDone = idx <= activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div
                key={step.key}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/10'
                    : isDone
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="font-bold text-sm font-display">{step.label}</span>
                </div>
                <p className="text-xs text-slate-400">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Application Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-2">
        {/* Left Column: Academic & Preferences */}
        <div className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" />
            <span>Applicant & Domain Preferences</span>
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Full Name:</span>
              <span className="font-semibold text-slate-200">{application.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">REVA Email:</span>
              <span className="font-semibold text-slate-200 truncate block">{application.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block">School / Branch:</span>
              <span className="font-semibold text-slate-200">{application.branch}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Semester / Year:</span>
              <span className="font-semibold text-slate-200">{application.semester}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Primary Wing:</span>
              <span className="font-bold text-amber-400 uppercase">{application.primaryWing}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Secondary Wing:</span>
              <span className="font-bold text-cyan-400 uppercase">{application.secondaryWing}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block">Role Preference:</span>
              <span className="font-semibold text-emerald-300">{application.roleApplied}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Audition Slot & Statement of Purpose */}
        <div className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>Reserved Audition Slot</span>
          </h4>

          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs space-y-1">
            <div className="font-bold text-cyan-200 text-sm">{application.auditionSlotName}</div>
            <p className="text-slate-400 text-[11px]">Bring your REVA Student ID card to the venue 10 mins prior to start time.</p>
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Statement of Purpose (SOP)</span>
            <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 italic leading-relaxed">
              "{application.answers?.sop || 'No SOP statement provided.'}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
