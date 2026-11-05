import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gavel, ClipboardList, Flag, ScrollText, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { isDisciplineUser } from '../lib/roles';
import { CASE_SEVERITIES, CHARTER, DUTY_ROSTERS } from '../lib/content';
import { PageShell, Tabs, Pill, Modal, FlagDots, inputClass, labelClass, primaryButton, ghostButton } from '../components/ui';
import { RequireRole } from './PortalPage';

const SEVERITY_TONE = { Commendation: 'good', Low: 'neutral', Medium: 'warn', High: 'bad' };
const CASE_STATUSES = ['Logged', 'Under review', 'Resolved', 'Closed'];
const EFFECT = {
  Commendation: 'Awards a star citation and +100 points.',
  Low: 'Removes one flag.',
  Medium: 'Removes one flag.',
  High: 'Removes two flags.',
};

function RecordsTab({ officer }) {
  const { disciplineCases, clubMembers, logDisciplineCase, setCaseStatus } = useData();
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ memberId: '', severity: 'Low', category: '', finding: '', action: '' });

  const shown = filter === 'All' ? disciplineCases : disciplineCases.filter((c) => c.severity === filter);
  const eligible = clubMembers.filter((m) => m.status !== 'fired');

  const submit = (e) => {
    e.preventDefault();
    logDisciplineCase({ ...form, officer });
    setForm({ memberId: '', severity: 'Low', category: '', finding: '', action: '' });
    setOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <Tabs size="sm" tabs={['All', ...CASE_SEVERITIES]} value={filter} onChange={setFilter} />
        <button onClick={() => setOpen(true)} className={primaryButton}><Plus className="w-4 h-4" /> Log a record</button>
      </div>

      <div className="glass-panel rounded-3xl overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-white/[0.07]">
              <th className="px-5 py-3 font-semibold">Case</th>
              <th className="px-5 py-3 font-semibold">Member</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Finding</th>
              <th className="px-5 py-3 font-semibold">Action taken</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.id} className="border-b border-white/[0.04] last:border-0 align-top">
                <td className="px-5 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">{c.id}<div className="text-slate-600">{c.date}</div></td>
                <td className="px-5 py-3"><div className="font-semibold text-white">{c.memberName}</div><div className="text-[11px] text-slate-500">{c.wing}</div></td>
                <td className="px-5 py-3"><Pill tone={SEVERITY_TONE[c.severity]}>{c.severity}</Pill><div className="text-[11px] text-slate-500 mt-1">{c.category}</div></td>
                <td className="px-5 py-3 text-xs text-slate-300 max-w-[260px]">{c.finding}</td>
                <td className="px-5 py-3 text-xs text-slate-400 max-w-[220px]">{c.action}<div className="text-slate-600 mt-1">Officer: {c.officer}</div></td>
                <td className="px-5 py-3">
                  <label className="sr-only" htmlFor={`status-${c.id}`}>Status for {c.id}</label>
                  <select id={`status-${c.id}`} value={c.status} onChange={(e) => setCaseStatus(c.id, e.target.value, officer)} className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200">
                    {CASE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">No records of this type.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Log a discipline record">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="case-member" className={labelClass}>Member</label>
            <select id="case-member" value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })} className={inputClass} required>
              <option value="">Choose a member</option>
              {eligible.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.wing} · {m.flags} flags</option>)}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="case-severity" className={labelClass}>Type</label>
              <select id="case-severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className={inputClass}>
                {CASE_SEVERITIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="case-category" className={labelClass}>Category</label>
              <input id="case-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} placeholder="e.g. Event duty" />
            </div>
          </div>
          <div>
            <label htmlFor="case-finding" className={labelClass}>Finding</label>
            <textarea id="case-finding" rows={3} value={form.finding} onChange={(e) => setForm({ ...form, finding: e.target.value })} className={inputClass} placeholder="What happened, when and where" required />
          </div>
          <div>
            <label htmlFor="case-action" className={labelClass}>Action taken</label>
            <input id="case-action" value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} className={inputClass} placeholder="e.g. Make-up duty shift assigned" required />
          </div>
          <p className="text-xs text-slate-400 border-l border-white/20 pl-3">Effect on the member: {EFFECT[form.severity]}</p>
          <button type="submit" className={primaryButton}><Gavel className="w-4 h-4" /> Log record</button>
        </form>
      </Modal>
    </div>
  );
}

function RosterTab() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {DUTY_ROSTERS.map((r) => {
        const pct = Math.round((r.filled / r.needed) * 100);
        return (
          <article key={r.id} className="glass-card rounded-3xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display font-bold text-white">{r.event}</h3>
              <Pill tone={pct >= 100 ? 'good' : pct >= 60 ? 'warn' : 'bad'}>{pct >= 100 ? 'Fully staffed' : `${r.filled}/${r.needed}`}</Pill>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-white" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1.5">Posts</div>
              <ul className="space-y-1 text-sm text-slate-300">{r.posts.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
            <div className="text-xs text-slate-400">Marshals: {r.marshals.join(', ')}</div>
          </article>
        );
      })}
    </div>
  );
}

function StandingsTab() {
  const { clubMembers } = useData();
  const sorted = [...clubMembers].sort((a, b) => (a.flags ?? 3) - (b.flags ?? 3));
  return (
    <div className="glass-panel rounded-3xl overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-white/[0.07]">
            <th className="px-5 py-3 font-semibold">Member</th>
            <th className="px-5 py-3 font-semibold">Wing</th>
            <th className="px-5 py-3 font-semibold">Flags</th>
            <th className="px-5 py-3 font-semibold">Standing</th>
            <th className="px-5 py-3 font-semibold text-right">Duty hours</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((m) => (
            <tr key={m.id} className="border-b border-white/[0.04] last:border-0">
              <td className="px-5 py-3"><div className="flex items-center gap-3"><img src={m.avatar} alt="" className="w-8 h-8 rounded-full object-cover grayscale" /><span className="font-semibold text-white">{m.name}</span></div></td>
              <td className="px-5 py-3 text-xs text-slate-300">{m.wing}</td>
              <td className="px-5 py-3"><FlagDots flags={m.flags} /></td>
              <td className="px-5 py-3"><Pill tone={m.status === 'active' ? 'good' : m.status === 'warning' ? 'warn' : 'bad'}>{m.status === 'fired' ? 'Ended' : m.status}</Pill></td>
              <td className="px-5 py-3 text-right font-serif text-white tabular-nums">{m.hoursWorked}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CharterTab() {
  return (
    <article id="charter" className="glass-panel rounded-[2rem] p-8 sm:p-12 max-w-3xl mx-auto space-y-8">
      <header className="text-center space-y-2">
        <div className="text-[10px] tracking-[0.35em] uppercase text-slate-500">Ratified by all five wings</div>
        <h2 className="font-display font-extrabold text-3xl text-white">The <span className="heading-accent">charter</span> of ORION</h2>
      </header>
      {CHARTER.map((a) => (
        <section key={a.article} className="space-y-2">
          <div className="text-[10px] tracking-[0.3em] uppercase text-slate-500">{a.article}</div>
          <h3 className="font-display font-bold text-lg text-white">{a.title}</h3>
          <p className="font-serif text-lg text-slate-300 leading-relaxed">{a.text}</p>
        </section>
      ))}
    </article>
  );
}

function Console() {
  const { currentUser } = useAuth();
  const { disciplineCases, clubMembers } = useData();
  const location = useLocation();
  const [tab, setTab] = useState(location.hash === '#charter' ? 'charter' : 'records');
  const officer = currentUser.displayName;

  useEffect(() => {
    if (location.hash === '#charter') setTab('charter');
  }, [location.hash]);

  const open = disciplineCases.filter((c) => c.status === 'Under review').length;
  const onWarning = clubMembers.filter((m) => m.status === 'warning').length;

  return (
    <PageShell className="space-y-10">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Proctor session · {currentUser.displayName}
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white">
            Discipline Wing <span className="heading-accent">discipline</span> console
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">The three-flag system, commendations, duty rosters and the club charter. Every ruling here is written to the audit trail.</p>
        </div>
        <div className="flex gap-3">
          <div className="glass-card rounded-2xl px-5 py-3 text-center"><div className="font-serif text-3xl text-white tabular-nums">{open}</div><div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Under review</div></div>
          <div className="glass-card rounded-2xl px-5 py-3 text-center"><div className="font-serif text-3xl text-white tabular-nums">{onWarning}</div><div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">On warning</div></div>
          <Link to="/committee" className={`${ghostButton} self-center hidden sm:inline-flex`}>Committee console</Link>
        </div>
      </header>

      <div className="overflow-x-auto -mx-4 px-4">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'records', label: 'Records & flags', icon: Gavel },
            { id: 'roster', label: 'Duty roster', icon: ClipboardList },
            { id: 'standings', label: 'Flag standings', icon: Flag },
            { id: 'charter', label: 'Charter', icon: ScrollText },
          ]}
        />
      </div>

      {tab === 'records' && <RecordsTab officer={officer} />}
      {tab === 'roster' && <RosterTab />}
      {tab === 'standings' && <StandingsTab />}
      {tab === 'charter' && <CharterTab />}
    </PageShell>
  );
}

export default function DisciplineConsole() {
  const location = useLocation();
  const { currentUser } = useAuth();
  // The charter is public; everything else needs Discipline Wing clearance.
  if (location.hash === '#charter' && !(currentUser && isDisciplineUser(currentUser))) {
    return (
      <PageShell>
        <CharterTab />
        <p className="text-center text-xs text-slate-500">The rest of the discipline console is for Discipline Wing leadership. <Link to="/portal" className="underline underline-offset-4 text-slate-300">Sign in</Link></p>
      </PageShell>
    );
  }
  return (
    <RequireRole allowed={isDisciplineUser} title="Discipline console">
      <Console />
    </RequireRole>
  );
}
