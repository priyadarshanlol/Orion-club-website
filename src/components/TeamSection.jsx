import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Users, Globe, ExternalLink, Mail, ShieldCheck, Award, GitBranch } from 'lucide-react';
import OrganizationalHierarchyTree from './OrganizationalHierarchyTree';

export default function TeamSection() {
  const { team, wings } = useData();
  const [filter, setFilter] = useState('Hierarchy Tree');

  // Collect all wing leads into a structured list
  const wingLeadsList = wings.flatMap(wing => 
    wing.leads.map(lead => ({
      ...lead,
      wingName: wing.name,
      wingCode: wing.code,
      category: 'Wing Leads'
    }))
  );

  const filterOptions = ['Hierarchy Tree', 'All Roster', 'Executive Council', 'Faculty Coordinators', 'Wing Leads'];

  return (
    <section id="team" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Leadership & Hierarchy</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-100 font-display">
              Meet Team <span className="gold-glow text-amber-400">ORION</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-400">
              The reporting structure, faculty mentors, executive council, and wing leads steering student innovation at REVA University.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            {filterOptions.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === f
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ORGANIZATIONAL HIERARCHY TREE VIEW */}
        {(filter === 'Hierarchy Tree' || filter === 'All Roster') && (
          <OrganizationalHierarchyTree />
        )}

        {/* FACULTY & EXECUTIVE COUNCIL */}
        {(filter === 'All Roster' || filter === 'Executive Council' || filter === 'Faculty Coordinators') && (
          <div className="space-y-10">
            {team
              .filter(group => filter === 'All Roster' || filter === group.category)
              .map((group, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-lg font-bold text-amber-400 font-display flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Award className="w-4 h-4" />
                    <span>{group.category}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {group.members.map((member, mIdx) => (
                      <div key={mIdx} className="glass-card rounded-2xl p-5 space-y-4 border border-slate-800 hover:border-amber-500/40 transition-all text-center">
                        <div className="relative w-24 h-24 mx-auto">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full rounded-full object-cover border-2 border-amber-400/60 shadow-lg shadow-amber-500/10"
                          />
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-slate-100 font-display">{member.name}</h4>
                          <span className="text-xs font-bold text-amber-400 block">{member.role}</span>
                          <span className="text-[11px] text-slate-400 block truncate">{member.branch}</span>
                        </div>

                        {member.email && (
                          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 truncate flex items-center justify-center gap-1">
                            <Mail className="w-3 h-3 text-cyan-400" />
                            <span>{member.email}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* WING LEADS */}
        {(filter === 'All Roster' || filter === 'Wing Leads') && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-cyan-400 font-display flex items-center gap-2 border-b border-slate-800 pb-2">
              <Users className="w-4 h-4" />
              <span>Wing Leads & Co-Leads</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wingLeadsList.map((lead, idx) => (
                <div key={idx} className="glass-card rounded-2xl p-5 space-y-3 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center gap-4">
                  <img
                    src={lead.avatar}
                    alt={lead.name}
                    className="w-16 h-16 rounded-full object-cover border border-cyan-400/60 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {lead.wingName} ({lead.wingCode})
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-100 font-display truncate mt-1">{lead.name}</h4>
                    <span className="text-xs text-amber-400 font-medium block">{lead.role}</span>
                    <span className="text-[11px] text-slate-400 block truncate">{lead.branch} • {lead.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
