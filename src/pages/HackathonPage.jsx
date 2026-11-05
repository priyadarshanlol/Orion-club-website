import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, Trophy, Briefcase, Users, Ticket, Coffee, ArrowDown } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Instagram } from '../components/BrandIcons';
import { PageShell, Pill, EmptyState, primaryButton, ghostButton } from '../components/ui';
import { RegistrationLookup, RegistrationReceipt } from './EventPages';
import AarambhForm, { WhatsAppJoin } from '../components/AarambhForm';
import { HACKATHON_ID, FORM_INTRO } from '../lib/hackathonForm';

/*
 * /hackathon: the Aarambh 2026 page. Event details come from the event record
 * (src/lib/data.js → Firestore events/aarambh-2026), matching the official
 * poster; the registration questions come from src/lib/hackathonForm.js,
 * matching the club's Google Form.
 */
export { HACKATHON_ID };

export default function HackathonPage() {
  const { events, eventSettingsFor, registrations } = useData();
  const event = events.find((e) => e.id === HACKATHON_ID);
  const settings = eventSettingsFor(HACKATHON_ID);
  const [registration, setRegistration] = useState(null);
  const [notice, setNotice] = useState('');

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
  const shown = registration ? registrations.find((r) => r.id === registration.id) || registration : null;
  const onRegistered = (reg, already) => {
    setRegistration(reg);
    setNotice(already ? 'This team lead email has already registered a team for Aarambh. Here is that registration.' : '');
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      <section id="register" className="glass-panel rounded-[2rem] p-6 sm:p-10 grid lg:grid-cols-[1fr_2fr] gap-8 [&>*]:min-w-0 scroll-mt-28">
        <div className="space-y-4">
          <h2 className="font-display font-bold text-white text-2xl sm:text-3xl">Orion Aarambh Hackathon <span className="heading-accent">Registration</span> 2026</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{FORM_INTRO}</p>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-5xl text-white">{settings.fee > 0 ? `₹${settings.fee}` : 'Free'}</span>
            {settings.fee > 0 && <span className="text-xs uppercase tracking-[0.2em] text-slate-500">per team</span>}
          </div>
          <p className="text-[11px] text-slate-500">* Indicates required question</p>
        </div>

        <div className="space-y-4">
          {shown ? (
            <>
              <RegistrationReceipt registration={shown} backTo="/hackathon" />
              <WhatsAppJoin />
            </>
          ) : !event.isUpcoming || !settings.registrationOpen ? (
            <p className="text-sm text-slate-400">Registration is closed right now.</p>
          ) : (
            <AarambhForm fee={settings.fee} onRegistered={onRegistered} />
          )}
          {notice && <p className="text-sm text-amber-200">{notice}</p>}
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
