import React, { useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock, MapPin, Ticket, Search, CreditCard, CheckCircle2, Hourglass, ShieldCheck } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { EventCard, Announcements } from '../components/HomeSections';
import { PageHeader, PageShell, Pill, EmptyState, Tabs, inputClass, labelClass, primaryButton, ghostButton } from '../components/ui';
import { payForRegistration, fetchRegistrationStatus, isLivePayments, paymentsAvailable } from '../lib/payments';
import { isLiveFirebaseConfigured } from '../lib/firebase';

export const STATUS_META = {
  confirmed: { label: 'Confirmed', tone: 'good', icon: CheckCircle2, text: 'Your seat is confirmed. Bring this registration id to the venue.' },
  pending_payment: {
    label: 'Payment pending',
    tone: 'warn',
    icon: CreditCard,
    text: paymentsAvailable
      ? 'Your seat is held until payment is complete.'
      : 'Your registration is saved. Online payment opens soon: the ORION team will contact you with how to pay the fee.',
  },
  verifying: {
    label: 'Verifying payment',
    tone: 'warn',
    icon: Hourglass,
    text: 'Your registration and payment details are saved. It will be confirmed once the ORION team has verified your payment.',
  },
  waitlisted: { label: 'Waitlisted', tone: 'steel', icon: Hourglass, text: 'The event is full. We will email you if a seat opens.' },
  cancelled: { label: 'Cancelled', tone: 'bad', icon: Hourglass, text: 'This registration was cancelled.' },
};

// ---------- Registration status lookup (shared by the list and event pages) ----------
export function RegistrationLookup() {
  const { findRegistration, events } = useData();
  const [regId, setRegId] = useState('');
  const [email, setEmail] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const lookup = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isLiveFirebaseConfigured) {
        const data = await fetchRegistrationStatus({ registrationId: regId.trim(), email: email.trim() });
        setResults(data.registrations || []);
      } else {
        // preview copy: registrations live in this browser only
        const q = regId.trim() || email.trim();
        setResults(findRegistration(q).filter((r) => !email.trim() || r.email === email.trim().toLowerCase()));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <h2 className="font-display font-bold text-white text-lg">Check your registration</h2>
      </div>
      <form onSubmit={lookup} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <label>
          <span className={labelClass}>Registration id</span>
          <input value={regId} onChange={(e) => setRegId(e.target.value)} placeholder="REG-…" className={inputClass} />
        </label>
        <label>
          <span className={labelClass}>Email used to register</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@reva.edu.in" className={inputClass} />
        </label>
        <button disabled={busy} className={primaryButton}>{busy ? 'Checking…' : 'Check status'}</button>
      </form>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      {results && (
        results.length === 0 ? (
          <p className="text-sm text-slate-400">No registration found for those details.</p>
        ) : (
          <ul className="space-y-2">
            {results.map((r) => {
              const meta = STATUS_META[r.status] || STATUS_META.confirmed;
              const ev = events.find((x) => x.id === r.eventId);
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{ev?.title || r.eventTitle || r.eventId}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{r.id} · {r.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill tone={meta.tone}>{meta.label}</Pill>
                    {r.status === 'pending_payment' && ev && paymentsAvailable && <Link to={`${ev.pagePath || `/events/${ev.id}`}?pay=${r.id}`} className="text-[11px] font-bold uppercase tracking-[0.16em] text-white hover:underline">Pay now</Link>}
                  </div>
                </li>
              );
            })}
          </ul>
        )
      )}
    </div>
  );
}

// ---------- /events ----------
export function EventsListPage() {
  const { events } = useData();
  const [tab, setTab] = useState('upcoming');
  const upcoming = events.filter((e) => e.isUpcoming);
  const past = events.filter((e) => !e.isUpcoming);
  const shown = tab === 'upcoming' ? upcoming : past;

  return (
    <PageShell>
      <PageHeader eyebrow="Campus calendar" title="Upcoming" accent="Events">
        Every ORION event has its own page. Open one to see the details, register, and pay if the event has a fee.
      </PageHeader>
      <div className="flex justify-center">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'upcoming', label: `Upcoming (${upcoming.length})` },
            { id: 'past', label: `Past (${past.length})` },
          ]}
        />
      </div>
      {shown.length === 0 ? (
        <EmptyState title={tab === 'upcoming' ? 'No upcoming events yet' : 'No past events yet'}>New events appear here as soon as the committee schedules them.</EmptyState>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {shown.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      )}
      <RegistrationLookup />
      <Announcements limit={6} />
    </PageShell>
  );
}

// ---------- /events/:eventId ----------
const EMPTY_FORM = { name: '', email: '', phone: '', srn: '', school: '', year: '' };

export function EventDetailPage() {
  const { eventId } = useParams();
  const { events, eventSettingsFor, registrationsFor, registerForEvent, markRegistrationPaid, registrations, showToast } = useData();
  const { currentUser } = useAuth();
  const [params] = useSearchParams();
  const event = events.find((e) => e.id === eventId);
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
  }));
  const [regId, setRegId] = useState(() => params.get('pay') || null);
  const [notice, setNotice] = useState('');
  const [paying, setPaying] = useState(false);

  if (!event) {
    return (
      <PageShell>
        <EmptyState title="Event not found" action={<Link to="/events" className={`${primaryButton} mt-4`}>All events</Link>}>
          This event may have been removed or the link is out of date.
        </EmptyState>
      </PageShell>
    );
  }

  if (event.pagePath) return <Navigate to={event.pagePath} replace />;

  const settings = eventSettingsFor(event.id);
  const taken = registrationsFor(event.id).filter((r) => r.status === 'confirmed' || r.status === 'pending_payment').length;
  const seatsLeft = settings.capacity > 0 ? Math.max(0, settings.capacity - taken) : null;
  const registration = regId ? registrations.find((r) => r.id === regId) : null;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const pay = async (reg) => {
    setPaying(true);
    setNotice('');
    try {
      const result = await payForRegistration({ registration: reg, event });
      markRegistrationPaid(reg.id, result);
      showToast(result.mode === 'test' ? 'Test payment recorded. No money was charged.' : 'Payment verified. Your seat is confirmed.', 'success');
    } catch (err) {
      setNotice(err.message);
    } finally {
      setPaying(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setNotice('');
    const res = await registerForEvent(event.id, form);
    if (!res.ok) {
      if (res.reason === 'already') {
        setRegId(res.registration.id);
        setNotice('You have already registered for this event with that email.');
      } else {
        setNotice(res.message || 'Registration for this event is closed.');
      }
      return;
    }
    setRegId(res.registration.id);
    if (res.registration.status === 'pending_payment' && paymentsAvailable) await pay(res.registration);
  };

  return (
    <PageShell>
      <Link to="/events" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> All events
      </Link>

      <div className="grid lg:grid-cols-[1.25fr_1fr] gap-8 [&>*]:min-w-0 items-start">
        <article className="glass-panel rounded-[2rem] overflow-hidden">
          <div className="relative aspect-[16/8]">
            <img src={event.bannerUrl} alt="" className="w-full h-full object-cover grayscale-[30%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute top-4 left-4 flex gap-2">
              <Pill tone={event.isUpcoming ? 'bright' : 'neutral'}>{event.isUpcoming ? 'Upcoming' : 'Completed'}</Pill>
              {event.tags?.slice(0, 2).map((t) => <Pill key={t}>{t}</Pill>)}
            </div>
          </div>
          <div className="p-6 sm:p-8 space-y-5">
            <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500">{event.wing}</div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white leading-tight">{event.title}</h1>
            <p className="text-slate-300 leading-relaxed">{event.description}</p>
            <ul className="grid sm:grid-cols-3 gap-3 text-sm text-slate-300">
              <li className="flex items-start gap-2"><CalendarDays className="w-4 h-4 mt-0.5 text-slate-500" />{event.date}</li>
              <li className="flex items-start gap-2"><Clock className="w-4 h-4 mt-0.5 text-slate-500" />{event.time}</li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-slate-500" />{event.venue}</li>
            </ul>
            {event.recapMetrics && (
              <div className="flex flex-wrap gap-2 pt-2">
                {Object.entries(event.recapMetrics).map(([k, v]) => <Pill key={k}>{v}</Pill>)}
              </div>
            )}
          </div>
        </article>

        <aside className="glass-panel rounded-[2rem] p-6 sm:p-8 space-y-5 lg:sticky lg:top-28">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display font-bold text-white text-xl flex items-center gap-2"><Ticket className="w-5 h-5" /> Registration</h2>
            <span className="font-serif text-3xl text-white">{settings.fee > 0 ? `₹${settings.fee}` : 'Free'}</span>
          </div>
          {seatsLeft !== null && event.isUpcoming && (
            <p className="text-xs text-slate-400">{seatsLeft > 0 ? `${seatsLeft} of ${settings.capacity} seats left` : 'Full: new registrations join the waitlist'}</p>
          )}

          {registration ? (
            <RegistrationReceipt registration={registration} onPay={() => pay(registration)} paying={paying} />
          ) : !event.isUpcoming ? (
            <p className="text-sm text-slate-400">This event has finished. Registration is closed.</p>
          ) : !settings.registrationOpen ? (
            <p className="text-sm text-slate-400">Registration for this event is closed right now.</p>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <label className="block"><span className={labelClass}>Full name</span><input required value={form.name} onChange={set('name')} className={inputClass} autoComplete="name" /></label>
              <label className="block"><span className={labelClass}>Email</span><input required type="email" value={form.email} onChange={set('email')} className={inputClass} autoComplete="email" /></label>
              <label className="block"><span className={labelClass}>Phone</span><input required type="tel" pattern="[0-9+ \-]{10,15}" value={form.phone} onChange={set('phone')} className={inputClass} autoComplete="tel" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className={labelClass}>SRN</span><input value={form.srn} onChange={set('srn')} className={inputClass} placeholder="Optional" /></label>
                <label className="block"><span className={labelClass}>Year</span>
                  <select value={form.year} onChange={set('year')} className={inputClass}>
                    <option value="">Select</option>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Other college'].map((y) => <option key={y}>{y}</option>)}
                  </select>
                </label>
              </div>
              <label className="block"><span className={labelClass}>School or college</span><input value={form.school} onChange={set('school')} className={inputClass} placeholder="e.g. School of C&IT" /></label>
              <button disabled={paying} className={`${primaryButton} w-full`}>
                {settings.fee > 0 && paymentsAvailable ? <><CreditCard className="w-4 h-4" /> Register and pay ₹{settings.fee}</> : 'Register'}
              </button>
              {settings.fee > 0 && (
                <p className="flex items-start gap-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {paymentNote()}
                </p>
              )}
            </form>
          )}
          {notice && <p className="text-sm text-amber-200">{notice}</p>}
        </aside>
      </div>
    </PageShell>
  );
}

export function paymentNote() {
  if (isLivePayments) return 'Payments are processed by Razorpay. ORION never sees your card or UPI details.';
  if (!paymentsAvailable) return 'Online payment opens soon. Register now to hold your place; the ORION team will contact you about paying the fee.';
  return 'Preview copy: payment runs in test mode and no money is charged.';
}

export function RegistrationReceipt({ registration, onPay, paying, backTo = '/events' }) {
  const meta = STATUS_META[registration.status] || STATUS_META.confirmed;
  const Icon = meta.icon;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/15 bg-black/30 p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-white font-semibold"><Icon className="w-4 h-4" /> {meta.label}</span>
          <Pill tone={meta.tone}>{registration.paid ? 'Paid' : registration.status === 'verifying' ? 'Payment submitted' : registration.amount > 0 ? 'Unpaid' : 'Free'}</Pill>
        </div>
        <p className="text-sm text-slate-400">{meta.text}</p>
        <dl className="text-xs space-y-1.5">
          <div className="flex justify-between gap-3"><dt className="text-slate-500">Registration id</dt><dd className="font-mono text-white">{registration.id}</dd></div>
          {registration.teamName && (
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Team</dt><dd className="text-slate-200 truncate">{registration.teamName}{registration.teamSize ? ` · ${registration.teamSize} members` : ''}</dd></div>
          )}
          <div className="flex justify-between gap-3"><dt className="text-slate-500">{registration.teamName ? 'Team lead' : 'Name'}</dt><dd className="text-slate-200">{registration.name}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-500">Email</dt><dd className="text-slate-200 truncate">{registration.email}</dd></div>
          {registration.payment?.utr && (
            <div className="flex justify-between gap-3"><dt className="text-slate-500">UTR number</dt><dd className="font-mono text-slate-200 truncate">{registration.payment.utr}</dd></div>
          )}
          {registration.payment?.paymentId && (
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Payment</dt><dd className="font-mono text-slate-200 truncate">{registration.payment.paymentId}</dd></div>
          )}
        </dl>
      </div>
      {registration.status === 'pending_payment' && paymentsAvailable && (
        <button onClick={onPay} disabled={paying} className={`${primaryButton} w-full`}>
          <CreditCard className="w-4 h-4" /> {paying ? 'Opening payment…' : `Pay ₹${registration.amount}`}
        </button>
      )}
      <p className="text-[11px] text-slate-500">Keep your registration id. You can check your status any time on the events page.</p>
      <Link to={backTo} className={`${ghostButton} w-full`}>Back to all events</Link>
    </div>
  );
}
