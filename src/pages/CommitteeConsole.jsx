import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone, Users, Building2, CalendarDays, Image as ImageIcon, ScrollText, Wrench, Trash2, Plus, Save, Ticket, Trophy, Inbox,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { isCommitteeUser, isDisciplineUser } from '../lib/roles';
import { DISPATCH_CATEGORIES, VENUE_STATUSES } from '../lib/content';
import MemberManagementHub from '../components/MemberManagementHub';
import AdminControlCenter from '../components/AdminControlCenter';
import { PageShell, Tabs, Pill, Modal, inputClass, labelClass, primaryButton, ghostButton, FlagDots } from '../components/ui';
import { RequireRole } from './PortalPage';
import { RegistrationsTab, SpotlightTab, InboxTab } from './ConsoleExtraTabs';

const SWITCHES = [
  { key: 'publicRsvp', label: 'Public event RSVP', text: 'Let visitors who are not signed in reserve seats on event pages.' },
  { key: 'recruitmentOpen', label: 'Recruitment open', text: 'Show the recruitment call to action as open across the site.' },
  { key: 'maintenanceMode', label: 'Maintenance notice', text: 'Show a maintenance banner to visitors while the committee updates the site.' },
];

const STATUS_TONE = { Available: 'good', Booked: 'steel', Maintenance: 'warn' };

function Toggle({ on, onClick, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`relative w-11 h-6 rounded-full border transition-colors shrink-0 ${on ? 'bg-white border-white' : 'bg-black/40 border-white/20'}`}
    >
      <span className={`absolute top-0.5 w-4.5 h-4.5 w-[18px] h-[18px] rounded-full transition-all ${on ? 'left-[22px] bg-slate-950' : 'left-0.5 bg-slate-500'}`} />
    </button>
  );
}

function OverviewTab({ operator }) {
  const { platformSwitches, togglePlatformSwitch, dispatches, publishDispatch, deleteDispatch, clubMembers } = useData();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General');

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    publishDispatch({ title, body, category, author: operator });
    setTitle('');
    setBody('');
  };

  const active = clubMembers.filter((m) => m.status === 'active').length;
  const warning = clubMembers.filter((m) => m.status === 'warning').length;
  const ended = clubMembers.filter((m) => m.status === 'fired').length;

  return (
    <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6 [&>*]:min-w-0">
      <div className="space-y-6">
        <section className="glass-panel rounded-3xl p-6 space-y-4">
          <h2 className="font-display font-bold text-white">Platform switches</h2>
          {SWITCHES.map((s) => (
            <div key={s.key} className="flex items-start justify-between gap-4 border-b border-white/[0.05] pb-4 last:border-0 last:pb-0">
              <div>
                <div className="text-sm font-semibold text-white">{s.label}</div>
                <div className="text-xs text-slate-500">{s.text}</div>
              </div>
              <Toggle on={platformSwitches[s.key]} label={s.label} onClick={() => togglePlatformSwitch(s.key, s.label, operator)} />
            </div>
          ))}
        </section>

        <section className="glass-panel rounded-3xl p-6 space-y-4">
          <h2 className="font-display font-bold text-white">Member pool</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[['Active', active], ['On warning', warning], ['Ended', ended]].map(([k, v]) => (
              <div key={k} className="glass-card rounded-xl p-3"><div className="font-serif text-3xl text-white tabular-nums">{v}</div><div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">{k}</div></div>
            ))}
          </div>
          <ul className="space-y-2">
            {clubMembers.slice(0, 5).map((m) => (
              <li key={m.id} className="flex items-center gap-3 text-sm">
                <img src={m.avatar} alt="" className="w-7 h-7 rounded-full object-cover grayscale" />
                <span className="flex-1 min-w-0 truncate text-slate-200">{m.name}<span className="text-slate-500 text-xs"> · {m.wing}</span></span>
                <FlagDots flags={m.flags} />
                <span className="font-serif text-white tabular-nums w-12 text-right">{m.points}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="space-y-6">
        <form onSubmit={submit} className="glass-panel rounded-3xl p-6 space-y-4">
          <h2 className="font-display font-bold text-white">Publish a notice</h2>
          <p className="text-xs text-slate-500">Notices appear on the home page, the events page and every member dashboard.</p>
          <div className="grid sm:grid-cols-[1fr_180px] gap-3">
            <div>
              <label htmlFor="notice-title" className={labelClass}>Title</label>
              <input id="notice-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Audition results are out" required />
            </div>
            <div>
              <label htmlFor="notice-category" className={labelClass}>Category</label>
              <select id="notice-category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {DISPATCH_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="notice-body" className={labelClass}>Message</label>
            <textarea id="notice-body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} className={inputClass} placeholder="What members and visitors need to know" required />
          </div>
          <button type="submit" className={primaryButton}><Megaphone className="w-4 h-4" /> Publish notice</button>
        </form>

        <section className="glass-panel rounded-3xl p-6 space-y-3">
          <h2 className="font-display font-bold text-white">Live notices</h2>
          {dispatches.map((d) => (
            <div key={d.id} className="flex items-start gap-3 border-b border-white/[0.05] pb-3 last:border-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1"><Pill>{d.category}</Pill><span className="text-[10px] text-slate-500 tabular-nums">{d.date}</span></div>
                <div className="text-sm font-semibold text-white">{d.title}</div>
                <div className="text-[11px] text-slate-500">By {d.author}</div>
              </div>
              <button onClick={() => deleteDispatch(d.id, operator)} className="p-2 rounded-full text-slate-500 hover:text-rose-300 hover:bg-rose-500/10" aria-label={`Remove notice ${d.title}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function VenuesTab({ operator }) {
  const { venues, setVenueStatus, addVenue } = useData();
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState('Available');
  const [bookedFor, setBookedFor] = useState('');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', block: '', capacity: '', liaison: '' });

  const openEdit = (v) => {
    setEditing(v);
    setStatus(v.status);
    setBookedFor(v.bookedFor || '');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Campus venue desk</h2>
          <p className="text-sm text-slate-400">Internal & External Wing tracks which campus venues are free, booked or under maintenance.</p>
        </div>
        <button onClick={() => setAdding(true)} className={ghostButton}><Plus className="w-4 h-4" /> Add venue</button>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {venues.map((v) => (
          <article key={v.id} className="glass-card rounded-3xl p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] tracking-[0.2em] uppercase text-slate-500 truncate">{v.block}</div>
                <h3 className="font-display font-bold text-white">{v.name}</h3>
              </div>
              <Pill tone={STATUS_TONE[v.status]}>{v.status}</Pill>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <div>Capacity <span className="text-slate-200 tabular-nums">{Number(v.capacity).toLocaleString()}</span></div>
              <div>Liaison <span className="text-slate-200">{v.liaison}</span></div>
              {v.bookedFor && <div>{v.status === 'Maintenance' ? 'Reason' : 'Booked for'} <span className="text-slate-200">{v.bookedFor}</span></div>}
            </div>
            {v.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {v.amenities.map((a) => <span key={a} className="px-2 py-0.5 rounded-full border border-white/10 text-[10px] text-slate-400">{a}</span>)}
              </div>
            )}
            <button onClick={() => openEdit(v)} className="mt-auto self-start text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:underline underline-offset-4">Change status</button>
          </article>
        ))}
      </div>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing ? `Update ${editing.name}` : ''}>
        <form
          onSubmit={(e) => { e.preventDefault(); setVenueStatus(editing.id, status, bookedFor, operator); setEditing(null); }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="venue-status" className={labelClass}>Status</label>
            <select id="venue-status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              {VENUE_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          {status !== 'Available' && (
            <div>
              <label htmlFor="venue-booked-for" className={labelClass}>{status === 'Maintenance' ? 'Reason' : 'Booked for'}</label>
              <input id="venue-booked-for" value={bookedFor} onChange={(e) => setBookedFor(e.target.value)} className={inputClass} placeholder={status === 'Maintenance' ? 'e.g. Sound system repair' : 'e.g. Tarang 2026 rehearsals'} required />
            </div>
          )}
          <button type="submit" className={primaryButton}><Save className="w-4 h-4" /> Save</button>
        </form>
      </Modal>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add a venue">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addVenue({ ...form, capacity: parseInt(form.capacity, 10) || 0 }, operator);
            setForm({ name: '', block: '', capacity: '', liaison: '' });
            setAdding(false);
          }}
          className="space-y-4"
        >
          {[['name', 'Venue name', 'e.g. Saraswathi Seminar Hall'], ['block', 'Block / location', 'e.g. Block 4, 2nd floor'], ['capacity', 'Capacity', 'e.g. 200'], ['liaison', 'Liaison', 'e.g. Rahul V (Internal & External Wing)']].map(([k, label, ph]) => (
            <div key={k}>
              <label htmlFor={`venue-${k}`} className={labelClass}>{label}</label>
              <input id={`venue-${k}`} type={k === 'capacity' ? 'number' : 'text'} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={inputClass} placeholder={ph} required />
            </div>
          ))}
          <button type="submit" className={primaryButton}><Plus className="w-4 h-4" /> Add venue</button>
        </form>
      </Modal>
    </div>
  );
}

function EventsTab({ operator }) {
  const { events, updateEventVenue, recordAudit } = useData();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Event production desk</h2>
          <p className="text-sm text-slate-400">Reschedule events and change venues. Full editing, cultural line-ups and recaps stay on the events page.</p>
        </div>
        <Link to="/events" className={ghostButton}>Open events page</Link>
      </div>
      <div className="glass-panel rounded-3xl overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-white/[0.07]">
              <th className="px-5 py-3 font-semibold">Event</th>
              <th className="px-5 py-3 font-semibold">Date & time</th>
              <th className="px-5 py-3 font-semibold">Venue</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-white/[0.04] last:border-0">
                <td className="px-5 py-3"><div className="font-semibold text-white">{e.title}</div><div className="text-[11px] text-slate-500">{e.wing}</div></td>
                <td className="px-5 py-3 text-xs text-slate-300">{e.date}<div className="text-slate-500">{e.time}</div></td>
                <td className="px-5 py-3 text-xs text-slate-300">{e.venue}</td>
                <td className="px-5 py-3"><Pill tone={e.isUpcoming ? 'bright' : 'neutral'}>{e.isUpcoming ? 'Upcoming' : 'Completed'}</Pill></td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => { setEditing(e); setForm({ date: e.date, time: e.time, venue: e.venue, venueCoordinator: e.venueCoordinator }); }} className="text-[11px] font-bold uppercase tracking-[0.16em] text-white hover:underline underline-offset-4">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing ? `Schedule: ${editing.title}` : ''}>
        <form
          onSubmit={(ev) => { ev.preventDefault(); updateEventVenue(editing.id, form); recordAudit(operator, 'Updated schedule', editing.title); setEditing(null); }}
          className="space-y-4"
        >
          {[['date', 'Date'], ['time', 'Time'], ['venue', 'Venue'], ['venueCoordinator', 'Venue coordinator']].map(([k, label]) => (
            <div key={k}>
              <label htmlFor={`evt-${k}`} className={labelClass}>{label}</label>
              <input id={`evt-${k}`} value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={inputClass} />
            </div>
          ))}
          <button type="submit" className={primaryButton}><Save className="w-4 h-4" /> Save schedule</button>
        </form>
      </Modal>
    </div>
  );
}

function MediaTab({ operator }) {
  const { events, uploadEventMedia, recordAudit } = useData();
  const [eventId, setEventId] = useState(events.find((e) => !e.isUpcoming)?.id || events[0]?.id);
  const [url, setUrl] = useState('');
  const [kind, setKind] = useState('images');
  const event = events.find((e) => e.id === eventId);
  const images = event?.media?.images || [];
  const videos = event?.media?.videos || [];
  const limit = kind === 'images' ? 10 : 5;
  const full = (kind === 'images' ? images : videos).length >= limit;

  const add = (e) => {
    e.preventDefault();
    if (!url.trim() || full) return;
    const next = { images, videos, [kind]: [...(kind === 'images' ? images : videos), url.trim()] };
    uploadEventMedia(eventId, next);
    recordAudit(operator, `Published ${kind === 'images' ? 'photo' : 'video'}`, event.title, 'Media & Marketing Wing');
    setUrl('');
  };

  const remove = (k, src) => {
    const next = { images, videos, [k]: (k === 'images' ? images : videos).filter((x) => x !== src) };
    uploadEventMedia(eventId, next);
    recordAudit(operator, 'Removed media', event.title, 'Media & Marketing Wing');
  };

  return (
    <div className="grid lg:grid-cols-[1fr_1.6fr] gap-6 [&>*]:min-w-0">
      <form onSubmit={add} className="glass-panel rounded-3xl p-6 space-y-4 h-fit">
        <h2 className="font-display font-bold text-white">Publish event media</h2>
        <p className="text-xs text-slate-500">Up to 10 photos and 5 videos per event. Media appears in the public gallery straight away.</p>
        <div>
          <label htmlFor="media-event" className={labelClass}>Event</label>
          <select id="media-event" value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputClass}>
            {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="media-kind" className={labelClass}>Type</label>
          <select id="media-kind" value={kind} onChange={(e) => setKind(e.target.value)} className={inputClass}>
            <option value="images">Photo</option>
            <option value="videos">Video</option>
          </select>
        </div>
        <div>
          <label htmlFor="media-url" className={labelClass}>File link</label>
          <input id="media-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} placeholder="https://..." required />
        </div>
        <button type="submit" disabled={full} className={primaryButton}><ImageIcon className="w-4 h-4" /> {full ? `Limit reached (${limit})` : 'Publish to gallery'}</button>
      </form>

      <section className="glass-panel rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-white truncate">{event?.title}</h2>
          <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">{images.length}/10 photos · {videos.length}/5 videos</span>
        </div>
        {images.length + videos.length === 0 ? (
          <p className="text-sm text-slate-500">No media published for this event yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((src) => (
              <div key={src} className="relative group rounded-xl overflow-hidden border border-white/10">
                <img src={src} alt="" className="w-full aspect-[4/3] object-cover" />
                <button onClick={() => remove('images', src)} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-slate-300 hover:text-rose-300" aria-label="Remove photo"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            {videos.map((src) => (
              <div key={src} className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50 aspect-[4/3] grid place-items-center text-xs text-slate-400 p-3 text-center break-all">
                Video · {src.split('/').pop()}
                <button onClick={() => remove('videos', src)} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-slate-300 hover:text-rose-300" aria-label="Remove video"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AuditTab() {
  const { auditLog } = useData();
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-xl text-white">Audit trail</h2>
        <p className="text-sm text-slate-400">Every notice, venue change, schedule edit, media update and discipline record, newest first.</p>
      </div>
      <div className="glass-panel rounded-3xl overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-white/[0.07]">
              <th className="px-5 py-3 font-semibold">Time</th>
              <th className="px-5 py-3 font-semibold">Operator</th>
              <th className="px-5 py-3 font-semibold">Action</th>
              <th className="px-5 py-3 font-semibold">Target</th>
              <th className="px-5 py-3 font-semibold">Wing</th>
            </tr>
          </thead>
          <tbody>
            {auditLog.map((a) => (
              <tr key={a.id} className="border-b border-white/[0.04] last:border-0">
                <td className="px-5 py-3 font-mono text-xs text-slate-400 whitespace-nowrap tabular-nums">{a.at}</td>
                <td className="px-5 py-3 text-slate-200">{a.operator}</td>
                <td className="px-5 py-3 text-white">{a.action}</td>
                <td className="px-5 py-3 text-xs text-slate-400">{a.target}</td>
                <td className="px-5 py-3 text-[11px] text-slate-500">{a.wing || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Console() {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState('overview');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const operator = `${currentUser.displayName} (${currentUser.position})`;

  const tabs = [
    { id: 'overview', label: 'Notices & settings', icon: Megaphone },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'venues', label: 'Venues', icon: Building2 },
    { id: 'events', label: 'Events', icon: CalendarDays },
    { id: 'registrations', label: 'Registrations', icon: Ticket },
    { id: 'spotlight', label: 'Spotlight', icon: Trophy },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'audit', label: 'Audit trail', icon: ScrollText },
  ];

  return (
    <PageShell className="space-y-10">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="text-[10px] tracking-[0.3em] uppercase text-slate-500">Core committee · {currentUser.wing}</div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white">
            Committee <span className="heading-accent">console</span>
          </h1>
          <p className="text-sm text-slate-400">Signed in as {currentUser.displayName}, {currentUser.position}.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isDisciplineUser(currentUser) && <Link to="/discipline" className={ghostButton}>Discipline console</Link>}
          <button onClick={() => setAdvancedOpen(true)} className={ghostButton}><Wrench className="w-4 h-4" /> Advanced data tools</button>
        </div>
      </header>

      <div className="overflow-x-auto -mx-4 px-4"><Tabs tabs={tabs} value={tab} onChange={setTab} /></div>

      {tab === 'overview' && <OverviewTab operator={operator} />}
      {tab === 'members' && <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-10"><MemberManagementHub onOpenAuth={() => {}} /></div>}
      {tab === 'venues' && <VenuesTab operator={operator} />}
      {tab === 'events' && <EventsTab operator={operator} />}
      {tab === 'registrations' && <RegistrationsTab operator={operator} />}
      {tab === 'spotlight' && <SpotlightTab operator={operator} />}
      {tab === 'inbox' && <InboxTab />}
      {tab === 'media' && <MediaTab operator={operator} />}
      {tab === 'audit' && <AuditTab />}

      <AdminControlCenter isOpen={advancedOpen} onClose={() => setAdvancedOpen(false)} />
    </PageShell>
  );
}

export default function CommitteeConsole() {
  return (
    <RequireRole allowed={isCommitteeUser} title="Committee console">
      <Console />
    </RequireRole>
  );
}
