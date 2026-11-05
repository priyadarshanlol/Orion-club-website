import React, { useMemo, useState } from 'react';
import { Search, Star } from 'lucide-react';
import { FlagDots, Tabs, inputClass } from './ui';

export const WING_FILTERS = ['All', 'Discipline Wing', 'Internal & External Wing', 'Cultural Wing', 'Technical Wing', 'Media & Marketing Wing', 'CORE LEADERSHIP'];
const CRESTS = ['Gold crest', 'Silver crest', 'Bronze crest'];

export const rankMembers = (members) =>
  [...members].filter((m) => m.status !== 'fired').sort((a, b) => (b.points || 0) - (a.points || 0));

const latestWork = (m) => m.timingLogs?.[0]?.task || '—';

// Points leaderboard with wing filter, search and a podium for the top three.
export default function Leaderboard({ members, highlightEmail }) {
  const [wing, setWing] = useState('All');
  const [query, setQuery] = useState('');

  const ranked = useMemo(() => rankMembers(members), [members]);
  const filtered = ranked.filter(
    (m) =>
      (wing === 'All' || m.wing === wing) &&
      (!query || `${m.name} ${m.srn} ${m.role}`.toLowerCase().includes(query.toLowerCase()))
  );
  const podium = filtered.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <Tabs size="sm" tabs={WING_FILTERS.map((w) => ({ id: w, label: w === 'CORE LEADERSHIP' ? 'Core' : w }))} value={wing} onChange={setWing} />
        <label className="relative block lg:w-72">
          <span className="sr-only">Search members</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input id="leaderboard-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, SRN or role" className={`${inputClass} pl-9`} />
        </label>
      </div>

      {podium.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4 items-end">
          {[1, 0, 2].map((pos) => {
            const m = podium[pos];
            if (!m) return <div key={pos} />;
            return (
              <div
                key={m.id}
                className={`glass-card rounded-3xl p-6 text-center space-y-3 ${pos === 0 ? 'sm:pb-10 border-white/30 shadow-[0_0_60px_-20px_rgba(255,255,255,0.5)]' : ''} ${pos === 1 ? 'sm:order-first' : ''}`}
              >
                <img src={m.avatar} alt="" className={`${pos === 0 ? 'w-20 h-20' : 'w-16 h-16'} mx-auto rounded-full object-cover border border-white/30`} />
                <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400">{CRESTS[pos]}</div>
                <div className="font-display font-bold text-white">{m.name}</div>
                <div className="text-[11px] text-slate-500">{m.srn} · {m.wing}</div>
                <div className="flex justify-center gap-6 pt-1">
                  <div><div className="font-serif text-3xl text-white tabular-nums">{m.points}</div><div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Points</div></div>
                  <div><div className="font-serif text-3xl text-white tabular-nums">{m.stars}</div><div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Stars</div></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="glass-panel rounded-3xl overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-white/[0.07]">
              <th className="px-5 py-3 font-semibold">Rank</th>
              <th className="px-5 py-3 font-semibold">Member</th>
              <th className="px-5 py-3 font-semibold">Wing</th>
              <th className="px-5 py-3 font-semibold">Latest contribution</th>
              <th className="px-5 py-3 font-semibold">Flags</th>
              <th className="px-5 py-3 font-semibold text-right">Stars</th>
              <th className="px-5 py-3 font-semibold text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              const rank = ranked.indexOf(m) + 1;
              const isMe = highlightEmail && m.email?.toLowerCase() === highlightEmail.toLowerCase();
              return (
                <tr key={m.id} className={`border-b border-white/[0.04] last:border-0 ${isMe ? 'bg-white/[0.07]' : 'hover:bg-white/[0.03]'}`}>
                  <td className="px-5 py-3 font-mono text-slate-400 tabular-nums">#{rank}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={m.avatar} alt="" className="w-8 h-8 rounded-full object-cover grayscale" />
                      <div>
                        <div className="font-semibold text-white">{m.name}{isMe && <span className="ml-2 text-[9px] uppercase tracking-[0.2em] text-slate-400">You</span>}</div>
                        <div className="text-[11px] text-slate-500">{m.srn}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-300">{m.wing}</td>
                  <td className="px-5 py-3 text-xs text-slate-400 max-w-[260px] truncate">{latestWork(m)}</td>
                  <td className="px-5 py-3"><FlagDots flags={m.flags} /></td>
                  <td className="px-5 py-3 text-right text-slate-200 tabular-nums"><span className="inline-flex items-center gap-1">{m.stars}<Star className="w-3 h-3 text-slate-500" /></span></td>
                  <td className="px-5 py-3 text-right font-serif text-lg text-white tabular-nums">{m.points}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500">No members match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
