import React, { useMemo, useState } from 'react';
import { Download, ExternalLink, Trash2, Plus, Save } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Pill, EmptyState, inputClass, labelClass, primaryButton, ghostButton } from '../components/ui';
import { STATUS_META } from './EventPages';

const WINGS = ['Discipline Wing', 'Internal & External Wing', 'Cultural Wing', 'Technical Wing', 'Media & Marketing Wing'];
const REG_STATUSES = ['confirmed', 'pending_payment', 'waitlisted', 'cancelled'];

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

// ---------- Registrations: per-event settings, attendee list, status, CSV export ----------
export function RegistrationsTab({ operator }) {
  const { events, eventSettingsFor, updateEventSettings, registrationsFor, setRegistrationStatus } = useData();
  const upcoming = events.filter((e) => e.isUpcoming);
  const [eventId, setEventId] = useState(upcoming[0]?.id || events[0]?.id || '');
  const event = events.find((e) => e.id === eventId);
  const settings = eventSettingsFor(eventId);
  const [draft, setDraft] = useState(null);
  const form = draft && draft.eventId === eventId ? draft : { eventId, fee: settings.fee, capacity: settings.capacity, registrationOpen: settings.registrationOpen };
  const regs = registrationsFor(eventId);
  const counts = useMemo(() => REG_STATUSES.reduce((acc, s) => ({ ...acc, [s]: regs.filter((r) => r.status === s).length }), {}), [regs]);
  const collected = regs.filter((r) => r.paid).reduce((n, r) => n + (Number(r.amount) || 0), 0);

  const save = (e) => {
    e.preventDefault();
    updateEventSettings(eventId, { fee: Math.max(0, Number(form.fee) || 0), capacity: Math.max(0, Number(form.capacity) || 0), registrationOpen: form.registrationOpen }, operator);
    setDraft(null);
  };

  const exportCsv = () => {
    const head = ['Registration id', 'Name', 'Email', 'Phone', 'SRN', 'School', 'Year', 'Status', 'Paid', 'Amount', 'Payment id', 'Registered at'];
    const rows = regs.map((r) => [r.id, r.name, r.email, r.phone, r.srn, r.school, r.year, r.status, r.paid ? 'yes' : 'no', r.amount, r.payment?.paymentId || '', r.createdAt]);
    const blob = new Blob([[head, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${eventId}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!event) return <EmptyState title="No events yet">Schedule an event first, then manage its registrations here.</EmptyState>;

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6 space-y-5">
        <label className="block max-w-xl">
          <span className={labelClass}>Event</span>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputClass}>
            {events.map((e) => <option key={e.id} value={e.id}>{e.isUpcoming ? '' : '(past) '}{e.title}</option>)}
          </select>
        </label>
        <form onSubmit={save} className="grid sm:grid-cols-[1fr_1fr_auto_auto] gap-4 items-end">
          <label className="block"><span className={labelClass}>Fee (₹, 0 = free)</span><input type="number" min="0" step="1" value={form.fee} onChange={(e) => setDraft({ ...form, fee: e.target.value })} className={inputClass} /></label>
          <label className="block"><span className={labelClass}>Capacity (0 = no limit)</span><input type="number" min="0" step="1" value={form.capacity} onChange={(e) => setDraft({ ...form, capacity: e.target.value })} className={inputClass} /></label>
          <label className="flex items-center gap-2 text-sm text-slate-300 pb-3">
            <input type="checkbox" checked={form.registrationOpen} onChange={(e) => setDraft({ ...form, registrationOpen: e.target.checked })} className="accent-white w-4 h-4" />
            Registration open
          </label>
          <button className={primaryButton}><Save className="w-4 h-4" /> Save</button>
        </form>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {REG_STATUSES.map((s) => (
          <div key={s} className="glass-card rounded-2xl p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{STATUS_META[s].label}</div>
            <div className="font-serif text-3xl text-white mt-1">{counts[s]}</div>
          </div>
        ))}
        <div className="glass-card rounded-2xl p-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Collected</div>
          <div className="font-serif text-3xl text-white mt-1">₹{collected}</div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-x-auto">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.07]">
          <h3 className="font-display font-bold text-white">Registrations ({regs.length})</h3>
          <button onClick={exportCsv} disabled={regs.length === 0} className={`${ghostButton} !px-4 !py-2`}><Download className="w-3.5 h-3.5" /> Export CSV</button>
        </div>
        {regs.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">No registrations for this event yet.</p>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-slate-500">
                <th className="px-5 py-3 font-semibold">Registration</th>
                <th className="px-5 py-3 font-semibold">Attendee</th>
                <th className="px-5 py-3 font-semibold">Payment</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {regs.map((r) => (
                <tr key={r.id} className="border-t border-white/[0.05] align-top">
                  <td className="px-5 py-3"><div className="font-mono text-xs text-white">{r.id}</div><div className="text-[11px] text-slate-500">{r.createdAt?.slice(0, 16).replace('T', ' ')}</div></td>
                  <td className="px-5 py-3"><div className="text-white">{r.name}</div><div className="text-[11px] text-slate-500">{r.email} · {r.phone}{r.srn ? ` · ${r.srn}` : ''}</div></td>
                  <td className="px-5 py-3">
                    {r.amount > 0 ? <Pill tone={r.paid ? 'good' : 'warn'}>{r.paid ? `Paid ₹${r.amount}` : `Due ₹${r.amount}`}</Pill> : <Pill>Free</Pill>}
                    {r.payment?.paymentId && <div className="font-mono text-[10px] text-slate-500 mt-1">{r.payment.paymentId}</div>}
                  </td>
                  <td className="px-5 py-3">
                    <select value={r.status} onChange={(e) => setRegistrationStatus(r.id, e.target.value, operator)} className={`${inputClass} !py-1.5 !text-xs`}>
                      {REG_STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ---------- Member spotlight ----------
const EMPTY_SPOT = { memberName: '', wing: WINGS[0], title: '', detail: '', date: '', postUrl: '', platform: 'Instagram' };

export function SpotlightTab({ operator }) {
  const { spotlights, addSpotlight, removeSpotlight, clubMembers } = useData();
  const [form, setForm] = useState(EMPTY_SPOT);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const validUrl = !form.postUrl || /^https:\/\//i.test(form.postUrl);

  const submit = (e) => {
    e.preventDefault();
    if (!validUrl) return;
    addSpotlight({ ...form, operator });
    setForm(EMPTY_SPOT);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6 [&>*]:min-w-0">
      <form onSubmit={submit} className="glass-panel rounded-3xl p-6 space-y-4">
        <h3 className="font-display font-bold text-white">Add a spotlight</h3>
        <label className="block"><span className={labelClass}>Member</span>
          <input required list="spotlight-members" value={form.memberName} onChange={set('memberName')} className={inputClass} placeholder="Start typing a name" />
          <datalist id="spotlight-members">{clubMembers.map((m) => <option key={m.id} value={m.name} />)}</datalist>
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block"><span className={labelClass}>Wing</span><select value={form.wing} onChange={set('wing')} className={inputClass}>{WINGS.map((w) => <option key={w}>{w}</option>)}</select></label>
          <label className="block"><span className={labelClass}>Date</span><input type="date" value={form.date} onChange={set('date')} className={inputClass} /></label>
        </div>
        <label className="block"><span className={labelClass}>Achievement</span><input required maxLength={120} value={form.title} onChange={set('title')} className={inputClass} placeholder="e.g. Won first place at …" /></label>
        <label className="block"><span className={labelClass}>Details</span><textarea rows={3} maxLength={500} value={form.detail} onChange={set('detail')} className={inputClass} /></label>
        <div className="grid sm:grid-cols-[1fr_140px] gap-4">
          <label className="block"><span className={labelClass}>Link to the post</span><input type="url" value={form.postUrl} onChange={set('postUrl')} className={inputClass} placeholder="https://…" /></label>
          <label className="block"><span className={labelClass}>Platform</span><select value={form.platform} onChange={set('platform')} className={inputClass}>{['Instagram', 'LinkedIn', 'YouTube', 'X', 'Website'].map((p) => <option key={p}>{p}</option>)}</select></label>
        </div>
        {!validUrl && <p className="text-xs text-rose-300">Post links must start with https://</p>}
        <button className={primaryButton}><Plus className="w-4 h-4" /> Publish spotlight</button>
      </form>

      <div className="glass-panel rounded-3xl p-6 space-y-3">
        <h3 className="font-display font-bold text-white">Published ({spotlights.length})</h3>
        {spotlights.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing published yet.</p>
        ) : (
          <ul className="space-y-2">
            {spotlights.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{s.title}</div>
                  <div className="text-[11px] text-slate-500">{s.memberName} · {s.wing} · {s.date}</div>
                  {s.postUrl && <a href={s.postUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white mt-1">{s.platform} post <ExternalLink className="w-3 h-3" /></a>}
                </div>
                <button onClick={() => removeSpotlight(s.id, operator)} className="p-2 rounded-full text-slate-500 hover:text-rose-300 hover:bg-white/5" aria-label={`Remove ${s.title}`}><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------- Inbox: messages from Connect with ORION ----------
export function InboxTab() {
  const { inquiries, setInquiryStatus } = useData();
  if (inquiries.length === 0) return <EmptyState title="Inbox is empty">Messages sent from the Connect with ORION page appear here.</EmptyState>;
  return (
    <ul className="space-y-3">
      {inquiries.map((m) => (
        <li key={m.id} className="glass-panel rounded-3xl p-5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Pill tone={m.status === 'new' ? 'bright' : 'neutral'}>{m.status === 'new' ? 'New' : 'Replied'}</Pill>
              <Pill>{m.topic}</Pill>
            </div>
            <span className="text-[11px] text-slate-500">{m.createdAt?.slice(0, 16).replace('T', ' ')}</span>
          </div>
          <div className="text-white font-semibold">{m.name} <span className="text-slate-500 font-normal text-sm">· {m.email}</span></div>
          <p className="text-sm text-slate-300 whitespace-pre-line">{m.message}</p>
          <div className="flex gap-3 pt-1">
            <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.topic}`)}`} className="text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:underline">Reply by email</a>
            {m.status === 'new' && <button onClick={() => setInquiryStatus(m.id, 'replied')} className="text-[11px] uppercase tracking-[0.18em] text-slate-400 hover:text-white">Mark replied</button>}
          </div>
        </li>
      ))}
    </ul>
  );
}
