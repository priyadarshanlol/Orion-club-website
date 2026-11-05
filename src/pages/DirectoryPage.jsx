import React, { useMemo, useState } from 'react';
import { Search, Mail, Phone, Users } from 'lucide-react';
import { Linkedin, Github, Instagram } from '../components/BrandIcons';
import { useData } from '../context/DataContext';
import { PageHeader, PageShell, Tabs, Modal, Pill, EmptyState, inputClass } from '../components/ui';

/*
 * Meet ORION: the organisational directory.
 * Everything here comes from the team and member data (DataContext). Nothing is
 * generated: the hierarchy is the order of the team groups, and the roster is
 * the active member list. To change who appears, change that data.
 */

const TIER_ORDER = ['Faculty Coordinators', 'President', 'Directors / Vice Presidents', 'Secretaries', 'Leads', 'Co-Leads'];

const WING_FILTERS = ['All', 'Discipline Wing', 'Internal & External Wing', 'Cultural Wing', 'Technical Wing', 'Media & Marketing Wing'];

const matches = (p, q) => !q || `${p.name} ${p.role || ''} ${p.wing || ''} ${p.branch || ''} ${p.srn || ''}`.toLowerCase().includes(q);
const inWing = (p, wing) => wing === 'All' || (p.wing || '').toLowerCase().includes(wing.toLowerCase());

function PersonTile({ person, onOpen }) {
  return (
    <button
      onClick={() => onOpen(person)}
      className="glass-card rounded-2xl p-4 flex items-center gap-3 text-left w-full hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
    >
      <img src={person.avatar} alt="" loading="lazy" className="w-12 h-12 rounded-full object-cover border border-white/15 grayscale-[30%] shrink-0" />
      <span className="min-w-0">
        <span className="block font-display font-semibold text-white truncate">{person.name}</span>
        <span className="block text-xs text-slate-400 truncate">{person.role}</span>
        {person.wing && <span className="block text-[10px] uppercase tracking-[0.16em] text-slate-500 truncate mt-0.5">{person.wing}</span>}
      </span>
    </button>
  );
}

function ProfileModal({ person, onClose }) {
  if (!person) return null;
  const social = person.social || {};
  const links = [
    person.email && { icon: Mail, label: person.email, href: `mailto:${person.email}` },
    (person.linkedin || social.linkedin) && (person.linkedin || social.linkedin) !== '#' && { icon: Linkedin, label: 'LinkedIn', href: person.linkedin || social.linkedin },
    social.github && social.github !== '#' && { icon: Github, label: 'GitHub', href: social.github },
    social.instagram && social.instagram !== '#' && { icon: Instagram, label: 'Instagram', href: social.instagram },
    person.phone && { icon: Phone, label: person.phone, href: `tel:${person.phone.replace(/\s/g, '')}` },
  ].filter(Boolean);
  return (
    <Modal open={!!person} onClose={onClose} title={person.name}>
      <div className="flex flex-col items-center text-center gap-3">
        <img src={person.avatar} alt="" className="w-24 h-24 rounded-full object-cover border border-white/20" />
        <div>
          <div className="font-display font-bold text-white text-xl">{person.name}</div>
          <div className="text-sm text-slate-300">{person.role}</div>
          {person.wing && <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mt-1">{person.wing}</div>}
          {person.branch && <div className="text-xs text-slate-500 mt-1">{person.branch}{person.year ? ` · ${person.year}` : ''}</div>}
        </div>
        {person.bio && <p className="text-sm text-slate-400 leading-relaxed">{person.bio}</p>}
        {person.skills?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5">{person.skills.map((s) => <Pill key={s}>{s}</Pill>)}</div>
        )}
        {links.length > 0 && (
          <ul className="w-full space-y-2 pt-2">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-white/10 hover:border-white/40 px-4 py-2.5 text-sm text-slate-200">
                  <l.icon className="w-4 h-4 text-slate-400" /> <span className="truncate">{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

export default function DirectoryPage() {
  const { team, clubMembers } = useData();
  const [query, setQuery] = useState('');
  const [wing, setWing] = useState('All');
  const [view, setView] = useState('hierarchy');
  const [person, setPerson] = useState(null);
  const q = query.trim().toLowerCase();

  const tiers = useMemo(() => {
    const ordered = [...team].sort((a, b) => {
      const ia = TIER_ORDER.indexOf(a.category);
      const ib = TIER_ORDER.indexOf(b.category);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    return ordered
      .map((g) => ({ ...g, members: g.members.filter((p) => matches(p, q) && inWing(p, wing)) }))
      .filter((g) => g.members.length > 0);
  }, [team, q, wing]);

  const leaderNames = useMemo(() => new Set(team.flatMap((g) => g.members.map((m) => m.name))), [team]);
  const roster = useMemo(
    () =>
      clubMembers
        .filter((m) => m.status !== 'fired' && !leaderNames.has(m.name))
        .map((m) => ({ ...m, role: m.role || m.position || 'Member' }))
        .filter((m) => matches(m, q) && inWing(m, wing)),
    [clubMembers, leaderNames, q, wing]
  );
  const total = tiers.reduce((n, t) => n + t.members.length, 0) + roster.length;

  return (
    <PageShell>
      <PageHeader eyebrow="Organisational directory" title="Meet" accent="ORION">
        The full ORION structure, from faculty coordinators to every wing member. Search by name, role, wing or school, and select anyone to open their profile.
      </PageHeader>

      <div className="glass-panel rounded-3xl p-4 sm:p-5 space-y-4 lg:sticky lg:top-24 z-20">
        <label className="relative block">
          <span className="sr-only">Search the directory</span>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, role, wing or school"
            className={`${inputClass} pl-11 py-3 text-base`}
            type="search"
          />
        </label>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="overflow-x-auto -mx-1 px-1">
            <Tabs size="sm" value={wing} onChange={setWing} tabs={WING_FILTERS.map((w) => ({ id: w, label: w === 'All' ? 'All wings' : w.replace(' Wing', '') }))} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 tabular-nums">{total} {total === 1 ? 'person' : 'people'}</span>
            <Tabs size="sm" value={view} onChange={setView} tabs={[{ id: 'hierarchy', label: 'Hierarchy' }, { id: 'grid', label: 'Everyone' }]} />
          </div>
        </div>
      </div>

      {total === 0 ? (
        <EmptyState title="No one matches that search">Try a different name, role or wing.</EmptyState>
      ) : view === 'hierarchy' ? (
        <div className="space-y-10">
          {tiers.map((tier, i) => (
            <section key={tier.category} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-slate-500">TIER {String(i + 1).padStart(2, '0')}</span>
                <h2 className="font-display font-bold text-white text-lg">{tier.category}</h2>
                <span className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] text-slate-500">{tier.members.length}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {tier.members.map((p) => <PersonTile key={`${tier.category}-${p.name}`} person={p} onOpen={setPerson} />)}
              </div>
            </section>
          ))}
          {roster.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-slate-500" />
                <h2 className="font-display font-bold text-white text-lg">Members</h2>
                <span className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] text-slate-500">{roster.length}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {roster.map((p) => <PersonTile key={p.id || p.name} person={p} onOpen={setPerson} />)}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {[...tiers.flatMap((t) => t.members.map((p) => ({ ...p, key: `${t.category}-${p.name}` }))), ...roster.map((p) => ({ ...p, key: p.id || p.name }))].map((p) => (
            <PersonTile key={p.key} person={p} onOpen={setPerson} />
          ))}
        </div>
      )}

      <ProfileModal person={person} onClose={() => setPerson(null)} />
    </PageShell>
  );
}
