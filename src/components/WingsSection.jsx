import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import WingCard from './WingCard';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, UserCheck, Layers, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WingsSection() {
  const { wings } = useData();
  const [activeWingId, setActiveWingId] = useState('arjuna');
  const [selectedWingModal, setSelectedWingModal] = useState(null);

  const activeWing = wings.find(w => w.id === activeWingId) || wings[0];

  return (
    <section id="wings" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Domains & Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-100 font-display">
            The {wings.length} <span className="gold-glow text-amber-400">Wings</span> of ORION
          </h2>

          <p className="text-sm sm:text-base text-slate-400">
            Each specialized wing powers a distinct pillar of student excellence at REVA University. Choose your primary and secondary interest domain for Recruitment 2026.
          </p>
        </div>

        {/* Wing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {wings.map((wing) => (
            <WingCard
              key={wing.id}
              wing={wing}
              isActive={activeWingId === wing.id}
              onClick={() => {
                setActiveWingId(wing.id);
                setSelectedWingModal(wing);
              }}
            />
          ))}
        </div>

        {/* Selected Wing In-Depth View Panel */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 relative overflow-hidden bg-gradient-to-b from-[#101216]/80 to-[#0c0d10]/90">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            {/* Left: Mission & Scope */}
            <div className="space-y-6 flex-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-display">
                  WING {activeWing.code}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-display">
                  {activeWing.name} <span className="text-sm font-normal text-slate-400">({activeWing.tagline})</span>
                </h3>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Mission Statement</h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  "{activeWing.mission}"
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Domain Scope & Responsibilities</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeWing.scope.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="#recruitment"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-slate-950 rounded-xl text-sm shadow-lg hover:from-amber-300 hover:to-amber-400 transition-all"
                >
                  <span>Apply for Wing {activeWing.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right: Leadership & Past Projects */}
            <div className="w-full lg:w-96 space-y-6">
              {/* Leadership Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span>Wing Leadership</span>
                </h4>

                <div className="space-y-3">
                  {activeWing.leads.map((lead, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <img src={lead.avatar} alt={lead.name} className="w-10 h-10 rounded-full object-cover border border-amber-400/40" />
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold text-slate-100">{lead.name}</div>
                        <div className="text-xs text-amber-400 font-medium">{lead.role} • <span className="text-slate-400">{lead.branch}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Highlights */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Past Flagship Highlights</span>
                </h4>

                <div className="space-y-2.5">
                  {activeWing.projectHighlights.map((proj, idx) => (
                    <div key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-left space-y-1">
                      <div className="text-xs font-bold text-cyan-300">{proj.title}</div>
                      <p className="text-[11px] text-slate-400 leading-snug">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
