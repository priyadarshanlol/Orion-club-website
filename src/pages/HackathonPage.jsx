import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, Trophy, Briefcase, Users, Ticket, Coffee, Plus, X, ShieldCheck, CreditCard, ArrowDown } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Instagram } from '../components/BrandIcons';
import { PageShell, Pill, EmptyState, inputClass, labelClass, primaryButton, ghostButton } from '../components/ui';
import { RegistrationLookup, RegistrationReceipt, paymentNote } from './EventPages';
import { payForRegistration, paymentsAvailable } from '../lib/payments';

/*
 * /hackathon: the Aarambh 2026 page. Every detail shown here comes from the
 * event record (src/lib/data.js → Firestore events/aarambh-2026), which matches
 * the official poster. Registration is per team; the person filling the form is
 * the team lead.
 */
export const HACKATHON_ID = 'aarambh-2026';

const blankMember = () => ({ name: '', email: '', srn: '' });

export default function HackathonPage() {
  const { events, eventSettingsFor, registerForEvent, markRegistrationPaid, registrations, showToast } = useData();
  const { currentUser } = useAuth();
  const [params] = useSearchParams();
  const event = events.find((e) => e.id === HACKATHON_ID);
  const settings = eventSettingsFor(HACKATHON_ID);
  const team = settings.team || { min: 2, max: 3 };
  const [form, setForm] = useState(() => ({
    teamName: '',
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    srn: '',
    school: '',
    year: '',
    members: Array.from({ length: Math.max(1, team.min - 1) }, blankMember),
  }));
  const [regId, setRegId] = useState(() => params.get('pay') || null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  if (!event) {
    return (
      <PageShell>
        <EmptyState title="Hackathon details are on their way" action={<Link to="/events" className={`${primaryButton} mt-4`}>All events</Link>}>
          Check the events page for the latest from ORION.
        </EmptyState>
      </PageShell>
    );
  }

  const h = event.hackathon || {};
  const registration = regId ? registrations.find((r) => r.id === regId) : null;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setMember = (i, k) => (e) => setForm((f) => ({ ...f, members: f.members.map((m, j) => (j === i ? { ...m, [k]: e.target.value } : m)) }));
  const addMember = () => setForm((f) => ({ ...f, members: [...f.members, blankMember()] }));
  const removeMember = (i) => setForm((f) => ({ ...f, members: f.members.filter((_, j) => j !== i) }));
  const canAdd = form.members.length + 1 < team.max;
  const canRemove = form.members.length + 1 > team.min;

  const pay = async (reg) => {
    setBusy(true);
    setNotice('');
    try {
      const result = await payForRegistration({ registration: reg, event });
      markRegistrationPaid(reg.id, result);
      showToast(result.mode === 'test' ? 'Test payment recorded. No money was charged.' : 'Payment verified. Your team is confirmed.', 'success');
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setNotice('');
    setBusy(true);
    let res;
    try {
      res = await registerForEvent(HACKATHON_ID, form);
    } finally {
      setBusy(false);
    }
    if (!res.ok) {
      if (res.reason === 'already') {
        setRegId(res.registration.id);
        setNotice('This email has already registered a team for Aarambh.');
      } else {
        setNotice(res.message || 'Registration is closed right now.');
      }
      return;
    }
    setRegId(res.registration.id);
    if (res.registration.status === 'pending_payment' && paymentsAvailable) await pay(res.registration);
  };

  const facts = [
    { icon: Trophy, label: 'Prize pool', value: h.prizePool },
    { icon: Briefcase, label: 'Internships', value: h.internships },
    { icon: Users, label: 'Team size', value: h.teamSize },
    { icon: Ticket, label: 'Registration', value: h.fee },
    { icon: Coffee, label: 'On the day', value: h.perks },
  ].filter((f) => f.value);

  return (
    <PageShell>
      {/* Hero */}
      <section className="grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center [&>*]:min-w-0">
        <div className="space-y-6 text-center lg:text-left">
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            <Pill tone="bright">Hackathon</Pill>
            <Pill>{event.wing}</Pill>
          </div>
          <h1 className="font-display font-extrabold text-5xl sm:text-7xl text-white leading-none tracking-tight">
            Aarambh <span className="heading-accent">2026</span>
          </h1>
          {h.tagline && <p className="hero-wordmark text-sm sm:text-base text-slate-300">{h.tagline}</p>}
          <p className="text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">{event.description}</p>
          <ul className="grid sm:grid-cols-3 gap-3 text-sm text-slate-200 text-left">
            <li className="glass-card rounded-2xl p-4 flex gap-3"><CalendarDays className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />{event.date}</li>
            <li className="glass-card rounded-2xl p-4 flex gap-3"><Clock className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />{event.time}</li>
            <li className="glass-card rounded-2xl p-4 flex gap-3"><MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />{event.venue}</li>
          </ul>
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <a href="#register" className={primaryButton}>Register your team <ArrowDown className="w-4 h-4" /></a>
            <a href="https://www.instagram.com/orionreva/" target="_blank" rel="noreferrer" className={ghostButton}><Instagram className="w-4 h-4" /> Updates on Instagram</a>
          </div>
        </div>
        <figure className="glass-panel rounded-[2rem] p-3 max-w-md w-full mx-auto">
          <img src={event.bannerUrl} alt="Aarambh 2026 poster: 12 November 2026, Rangasthala, SVB Block. Prize pool gadgets worth ₹20,000, internships for the top 4 teams, teams of 2 to 3, ₹200 per team." className="w-full rounded-[1.5rem]" />
        </figure>
      </section>

      {/* Key facts */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {facts.map((f) => (
          <div key={f.label} className="glass-card rounded-3xl p-5 space-y-3">
            <span className="w-10 h-10 rounded-2xl border border-white/20 grid place-items-center text-white"><f.icon className="w-5 h-5" /></span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{f.label}</div>
              <div className="font-display font-semibold text-white mt-1 leading-snug">{f.value}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Registration */}
      <section id="register" className="glass-panel rounded-[2rem] p-6 sm:p-10 grid lg:grid-cols-[1fr_1.5fr] gap-8 [&>*]:min-w-0 scroll-mt-28">
        <div className="space-y-4">
          <h2 className="font-display font-bold text-white text-2xl sm:text-3xl">Register your <span className="heading-accent">team</span></h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            One person registers the whole team as team lead. Teams have {team.min} to {team.max} members including the lead.
            {settings.fee > 0 ? ` The fee is ₹${settings.fee} per team.` : ''}
          </p>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-5xl text-white">{settings.fee > 0 ? `₹${settings.fee}` : 'Free'}</span>
            {settings.fee > 0 && <span className="text-xs uppercase tracking-[0.2em] text-slate-500">per team</span>}
          </div>
          {settings.fee > 0 && (
            <p className="flex items-start gap-2 text-[11px] text-slate-500"><ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />{paymentNote()}</p>
          )}
        </div>

        <div>
          {registration ? (
            <RegistrationReceipt registration={registration} onPay={() => pay(registration)} paying={busy} backTo="/hackathon" />
          ) : !event.isUpcoming || !settings.registrationOpen ? (
            <p className="text-sm text-slate-400">Registration is closed right now.</p>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <label className="block"><span className={labelClass}>Team name</span><input required maxLength={60} value={form.teamName} onChange={set('teamName')} className={inputClass} /></label>

              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold text-white mb-1">Team lead (you)</legend>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="block"><span className={labelClass}>Full name</span><input required value={form.name} onChange={set('name')} className={inputClass} autoComplete="name" /></label>
                  <label className="block"><span className={labelClass}>Email</span><input required type="email" value={form.email} onChange={set('email')} className={inputClass} autoComplete="email" /></label>
                  <label className="block"><span className={labelClass}>Phone</span><input required type="tel" pattern="[0-9+ \-]{10,15}" value={form.phone} onChange={set('phone')} className={inputClass} autoComplete="tel" /></label>
                  <label className="block"><span className={labelClass}>SRN</span><input value={form.srn} onChange={set('srn')} className={inputClass} placeholder="Optional" /></label>
                  <label className="block"><span className={labelClass}>Year</span>
                    <select value={form.year} onChange={set('year')} className={inputClass}>
                      <option value="">Select</option>
                      {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Other college'].map((y) => <option key={y}>{y}</option>)}
                    </select>
                  </label>
                  <label className="block"><span className={labelClass}>School or college</span><input value={form.school} onChange={set('school')} className={inputClass} placeholder="e.g. School of CSE" /></label>
                </div>
              </fieldset>

              {form.members.map((m, i) => (
                <fieldset key={i} className="space-y-3 rounded-2xl border border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <legend className="text-xs font-semibold text-white">Member {i + 2}</legend>
                    {canRemove && (
                      <button type="button" onClick={() => removeMember(i)} className="text-slate-500 hover:text-white" aria-label={`Remove member ${i + 2}`}><X className="w-4 h-4" /></button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <label className="block"><span className={labelClass}>Full name</span><input required value={m.name} onChange={setMember(i, 'name')} className={inputClass} /></label>
                    <label className="block"><span className={labelClass}>Email</span><input required type="email" value={m.email} onChange={setMember(i, 'email')} className={inputClass} /></label>
                    <label className="block"><span className={labelClass}>SRN</span><input value={m.srn} onChange={setMember(i, 'srn')} className={inputClass} placeholder="Optional" /></label>
                  </div>
                </fieldset>
              ))}
              {canAdd && (
                <button type="button" onClick={addMember} className={`${ghostButton} !py-2`}><Plus className="w-4 h-4" /> Add member {form.members.length + 2}</button>
              )}

              <button disabled={busy} className={`${primaryButton} w-full`}>
                {busy ? 'Registering…' : settings.fee > 0 && paymentsAvailable ? <><CreditCard className="w-4 h-4" /> Register and pay ₹{settings.fee}</> : 'Register team'}
              </button>
              <p className="text-[11px] text-slate-500">Each member must use a different email. You get a registration id to check your status any time.</p>
            </form>
          )}
          {notice && <p className="text-sm text-amber-200 mt-3">{notice}</p>}
        </div>
      </section>

      {/* Partners */}
      {h.partners?.length > 0 && (
        <section className="space-y-4 text-center">
          <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">In association with</div>
          <div className="flex flex-wrap justify-center gap-3">
            {h.partners.map((p) => (
              <span key={p} className="glass-card rounded-2xl px-5 py-3 font-display font-semibold text-white text-sm">{p}</span>
            ))}
          </div>
        </section>
      )}

      <RegistrationLookup />
    </PageShell>
  );
}

// Homepage strip pointing to the hackathon while registration is open
export function HackathonBanner() {
  const { events, eventSettingsFor } = useData();
  const event = events.find((e) => e.id === HACKATHON_ID);
  if (!event || !event.isUpcoming) return null;
  const settings = eventSettingsFor(HACKATHON_ID);
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <Link
        to="/hackathon"
        className="glass-panel rounded-[2rem] p-5 sm:p-6 flex flex-col md:flex-row items-center gap-5 md:gap-8 group hover:border-white/40 transition-colors"
      >
        <img src={event.bannerUrl} alt="" className="w-24 h-32 object-cover rounded-2xl border border-white/15 shrink-0" />
        <div className="flex-1 text-center md:text-left space-y-2 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Hackathon · {event.date}</div>
          <div className="font-display font-extrabold text-3xl sm:text-4xl text-white">Aarambh <span className="heading-accent">2026</span></div>
          <p className="text-sm text-slate-400">{event.hackathon?.prizePool} · {event.hackathon?.teamSize} · {event.venue.split(',').slice(0, 2).join(',')}</p>
        </div>
        <span className={`${primaryButton} shrink-0`}>
          {settings.registrationOpen ? 'Register your team' : 'View details'} <ArrowDown className="w-4 h-4 -rotate-90" />
        </span>
      </Link>
    </section>
  );
}
