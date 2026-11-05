import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail, Phone, GitBranch, LayoutGrid, Lock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { WING_CONSTELLATIONS } from '../lib/content';
import WingConstellation from '../components/WingConstellation';
import { EventCard } from '../components/HomeSections';
import { PageShell, PageHeader, Tabs, Modal, Pill, FlagDots, primaryButton, ghostButton } from '../components/ui';
import { NotFoundPage } from './SimplePages';

const belongs = (wingField = '', wingName) => wingField.toUpperCase().startsWith(wingName.toUpperCase());

function PersonCard({ person, tier, onOpen, large = false }) {
  return (
    <button
      onClick={() => onOpen(person)}
      className={`glass-card rounded-2xl p-4 flex items-center gap-3 text-left w-full hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${large ? 'sm:p-5' : ''}`}
    >
      <img src={person.avatar} alt="" className={`${large ? 'w-14 h-14' : 'w-11 h-11'} rounded-full object-cover grayscale border border-white/20 shrink-0`} />
      <div className="min-w-0">
        <div className="text-[9px] tracking-[0.22em] uppercase text-slate-500">{tier}</div>
        <div className="font-display font-bold text-white truncate">{person.name}</div>
        <div className="text-xs text-slate-400 truncate">{person.role}</div>
      </div>
    </button>
  );
}

export default function WingDetailPage() {
  const { wingId } = useParams();
  const { wings, team, clubMembers, events } = useData();
  const [view, setView] = useState('tree');
  const [person, setPerson] = useState(null);

  const index = wings.findIndex((w) => w.id === wingId);
  const wing = wings[index];
  const chart = WING_CONSTELLATIONS[wingId];

  const hierarchy = useMemo(() => {
    if (!wing) return null;
    const fromTeam = (pattern) =>
      (team.find((g) => pattern.test(g.category))?.members || []).filter((m) => belongs(m.wing, wing.name));
    const directors = fromTeam(/director/i);
    const secretaries = fromTeam(/secretar/i);
    const leadNames = new Set();
    const leads = [...fromTeam(/^leads$/i), ...wing.leads.filter((l) => /lead/i.test(l.role) && !/co-lead/i.test(l.role))].filter((l) => {
      if (leadNames.has(l.name)) return false;
      leadNames.add(l.name);
      return true;
    });
    const coLeads = [...fromTeam(/co-lead/i), ...wing.leads.filter((l) => /co-lead/i.test(l.role))].filter((l) => {
      if (leadNames.has(l.name)) return false;
      leadNames.add(l.name);
      return true;
    });
    const shown = new Set([...directors, ...secretaries, ...leads, ...coLeads].map((p) => p.name));
    const roster = clubMembers.filter((m) => belongs(m.wing, wing.name) && !shown.has(m.name) && m.status !== 'fired');
    return { directors, secretaries, leads, coLeads, roster };
  }, [wing, team, clubMembers]);

  if (!wing) return <NotFoundPage />;

  const prev = wings[(index - 1 + wings.length) % wings.length];
  const next = wings[(index + 1) % wings.length];
  const wingEvents = events.filter((e) => e.wingId === wing.id || (e.wing || '').toUpperCase().includes(wing.name.toUpperCase()));
  const tiers = [
    ['Tier 1 · Director', hierarchy.directors],
    ['Tier 2 · Secretary', hierarchy.secretaries],
    ['Tier 3 · Lead', hierarchy.leads],
    ['Tier 3 · Co-lead', hierarchy.coLeads],
  ];
  const officerCount = tiers.reduce((n, [, list]) => n + list.length, 0);

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.2em]">
        <Link to="/wings" className="flex items-center gap-2 text-slate-400 hover:text-white"><ArrowLeft className="w-4 h-4" /> All wings</Link>
        <Link to={`/wings/${next.id}`} className="flex items-center gap-2 text-slate-400 hover:text-white">Next: {next.name} <ArrowRight className="w-4 h-4" /></Link>
      </div>

      <section className="grid lg:grid-cols-[1.1fr_1fr] gap-10 [&>*]:min-w-0 items-center">
        <div className="space-y-5 min-w-0">
          <div className="flex flex-wrap gap-2">
            <Pill tone="bright">Wing {wing.code}</Pill>
            <Pill>{chart.star} · {chart.designation}</Pill>
            <Pill>{chart.nodes.length} stars</Pill>
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-white leading-none">{wing.name}</h1>
          <p className="font-serif italic text-xl sm:text-2xl text-slate-200">{wing.tagline}</p>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">{wing.mission}</p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[['Right ascension', chart.ra], ['Declination', chart.dec], ['Distance', chart.distance], ['Class', chart.spectral.split(' · ')[0]]].map(([k, v]) => (
              <div key={k} className="border-l border-white/15 pl-3">
                <dt className="text-[9px] tracking-[0.22em] uppercase text-slate-500">{k}</dt>
                <dd className="font-mono text-xs text-slate-200">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-3 pt-2">
            <a href="#hierarchy" className={primaryButton}>Wing hierarchy</a>
            <Link to="/recruitment" className={ghostButton}>Apply to {wing.name}</Link>
            {wing.id === 'discipline' && <Link to="/discipline" className={ghostButton}><Lock className="w-3.5 h-3.5" /> Discipline console</Link>}
          </div>
        </div>
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <WingConstellation chart={chart} title={wing.name} animateKey={wing.id} />
          <p className="text-center text-[10px] tracking-[0.35em] uppercase text-slate-500 mt-3">Star chart · {wing.name}</p>
        </div>
      </section>

      <section id="hierarchy" className="space-y-8 scroll-mt-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <PageHeader as="h2" align="left" eyebrow={`Governance · ${officerCount} officers · ${hierarchy.roster.length} members`} title="Wing" accent="hierarchy">
            Direction flows from the wing director and secretary down to leads, co-leads and members on the roster.
          </PageHeader>
          <Tabs value={view} onChange={setView} size="sm" tabs={[{ id: 'tree', label: 'Org tree', icon: GitBranch }, { id: 'grid', label: 'Roster grid', icon: LayoutGrid }]} />
        </div>

        {view === 'tree' ? (
          <div className="glass-panel rounded-[2rem] p-6 sm:p-10 space-y-2">
            {tiers.filter(([, list]) => list.length).map(([label, list], i) => (
              <div key={label} className="flex flex-col items-center">
                {i > 0 && <div className="w-px h-8 bg-gradient-to-b from-white/10 to-white/40" />}
                <div className="text-[10px] tracking-[0.3em] uppercase text-slate-500 mb-3">{label}</div>
                <div className="flex flex-wrap justify-center gap-3 w-full">
                  {list.map((p) => (
                    <div key={p.name} className="w-full sm:w-72"><PersonCard person={p} tier={label.split(' · ')[1]} onOpen={setPerson} large={i === 0} /></div>
                  ))}
                </div>
              </div>
            ))}
            {hierarchy.roster.length > 0 && (
              <div className="flex flex-col items-center">
                <div className="w-px h-8 bg-gradient-to-b from-white/10 to-white/40" />
                <div className="text-[10px] tracking-[0.3em] uppercase text-slate-500 mb-3">Members on the roster</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {hierarchy.roster.map((m) => (
                    <button key={m.id} onClick={() => setPerson(m)} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-white/10 hover:border-white/40 bg-black/30">
                      <img src={m.avatar} alt="" className="w-6 h-6 rounded-full object-cover grayscale" />
                      <span className="text-xs text-slate-200">{m.name}</span>
                      <FlagDots flags={m.flags} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tiers.flatMap(([label, list]) => list.map((p, j) => <PersonCard key={`${label}-${p.name}-${j}`} person={p} tier={label.split(' · ')[1]} onOpen={setPerson} />))}
            {hierarchy.roster.map((m) => <PersonCard key={m.id} person={m} tier="Member" onOpen={setPerson} />)}
          </div>
        )}
      </section>

      <section className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-5">
          <PageHeader as="h2" align="left" eyebrow="Mandate" title="Key" accent="directives" />
          <ol className="space-y-3">
            {wing.scope.map((s, i) => (
              <li key={s} className="glass-card rounded-2xl p-4 flex gap-4">
                <span className="font-mono text-[10px] text-slate-500 pt-0.5 tabular-nums">D{String(i + 1).padStart(2, '0')}</span>
                <span className="text-sm text-slate-200">{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-5">
          <PageHeader as="h2" align="left" eyebrow="Track record" title="Flagship" accent="work" />
          <div className="space-y-3">
            {wing.projectHighlights.map((p) => (
              <div key={p.title} className="glass-card rounded-2xl p-5">
                <h3 className="font-display font-bold text-white">{p.title}</h3>
                <p className="text-sm text-slate-400">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {wingEvents.length > 0 && (
        <section className="space-y-6">
          <PageHeader as="h2" align="left" eyebrow="Initiatives" title="Wing" accent="events" />
          <div className="grid md:grid-cols-3 gap-5">
            {wingEvents.slice(0, 3).map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/[0.07] text-[11px] uppercase tracking-[0.2em]">
        <Link to={`/wings/${prev.id}`} className="flex items-center gap-2 text-slate-400 hover:text-white"><ArrowLeft className="w-4 h-4" /> {prev.name}</Link>
        <Link to={`/wings/${next.id}`} className="flex items-center gap-2 text-slate-400 hover:text-white">{next.name} <ArrowRight className="w-4 h-4" /></Link>
      </div>

      <Modal open={Boolean(person)} onClose={() => setPerson(null)} title={person?.name || ''}>
        {person && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={person.avatar} alt="" className="w-20 h-20 rounded-full object-cover grayscale border border-white/20" />
              <div>
                <div className="font-display font-bold text-white text-lg">{person.name}</div>
                <div className="text-sm text-slate-300">{person.role}</div>
                <div className="text-xs text-slate-500">{person.branch}{person.year ? ` · ${person.year}` : ''}</div>
              </div>
            </div>
            {person.points !== undefined && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="glass-card rounded-xl p-3"><div className="font-serif text-2xl text-white">{person.points}</div><div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Points</div></div>
                <div className="glass-card rounded-xl p-3"><div className="font-serif text-2xl text-white">{person.stars}</div><div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Stars</div></div>
                <div className="glass-card rounded-xl p-3 flex flex-col items-center justify-center gap-1.5"><FlagDots flags={person.flags} /><div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Flags</div></div>
              </div>
            )}
            <div className="space-y-2 text-sm">
              {person.email && <a href={`mailto:${person.email}`} className="flex items-center gap-2 text-slate-300 hover:text-white"><Mail className="w-4 h-4 text-slate-500" />{person.email}</a>}
              {person.phone && <div className="flex items-center gap-2 text-slate-300"><Phone className="w-4 h-4 text-slate-500" />{person.phone}</div>}
            </div>
          </div>
        )}
      </Modal>
    </PageShell>
  );
}
