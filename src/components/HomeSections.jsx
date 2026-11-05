import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock, MapPin } from 'lucide-react';
import { useData } from '../context/DataContext';
import { MILESTONES, INDUCTION_CREED } from '../lib/content';
import { PageHeader, Pill, primaryButton, ghostButton } from './ui';
import Gallery from './Gallery';
import ContactSection from './ContactSection';
import Sparkle from './Sparkle';

const Section = ({ id, children }) => (
  <section id={id} className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto space-y-10">{children}</div>
  </section>
);

export function EventCard({ event, compact = false }) {
  const { eventSettingsFor } = useData();
  const settings = eventSettingsFor(event.id);
  const to = `/events/${event.id}`;
  return (
    <article className="glass-card rounded-3xl overflow-hidden flex flex-col group">
      <Link to={to} className="relative aspect-[16/9] overflow-hidden block" tabIndex={-1} aria-hidden="true">
        <img src={event.bannerUrl} alt="" loading="lazy" className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Pill tone={event.isUpcoming ? 'bright' : 'neutral'}>{event.isUpcoming ? 'Upcoming' : 'Completed'}</Pill>
          {event.isUpcoming && <Pill>{settings.fee > 0 ? `₹${settings.fee}` : 'Free'}</Pill>}
        </div>
      </Link>
      <div className="p-5 sm:p-6 flex flex-col gap-3 flex-1">
        <div className="text-[10px] tracking-[0.22em] uppercase text-slate-500">{event.wing}</div>
        <h3 className="font-display font-bold text-lg text-white leading-snug">
          <Link to={to} className="hover:underline underline-offset-4">{event.title}</Link>
        </h3>
        {!compact && <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{event.description}</p>}
        <ul className="space-y-1.5 text-xs text-slate-300 mt-auto">
          <li className="flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5 text-slate-500" />{event.date}</li>
          <li className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-500" />{event.time}</li>
          <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-500" />{event.venue}</li>
        </ul>
        <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between gap-3">
          <Link to={to} className="text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:underline underline-offset-4">
            {event.isUpcoming ? (settings.registrationOpen ? 'Register' : 'View event') : 'View recap'}
          </Link>
          <Link to={to} className="text-slate-400 hover:text-white" aria-label={`Open ${event.title}`}><ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </article>
  );
}

export function EventsPreview() {
  const { events } = useData();
  const upcoming = events.filter((e) => e.isUpcoming).slice(0, 3);
  const list = upcoming.length ? upcoming : events.slice(0, 3);
  return (
    <Section id="events-preview">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageHeader as="h2" align="left" eyebrow="Campus calendar" title="Events &" accent="Initiatives">
          Recruitment, festivals, hackathons and expos run by the five wings across REVA.
        </PageHeader>
        <Link to="/events" className={ghostButton}>Full schedule <ArrowRight className="w-4 h-4" /></Link>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {list.map((e) => <EventCard key={e.id} event={e} />)}
      </div>
    </Section>
  );
}

export function Milestones() {
  return (
    <Section id="milestones">
      <PageHeader as="h2" eyebrow="On the record" title="Milestones &" accent="Honours">
        Numbers the wings have earned at REVA and beyond.
      </PageHeader>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MILESTONES.map((m) => (
          <div key={m.label} className="glass-card rounded-3xl p-6 space-y-3">
            <div className="font-serif text-5xl text-white leading-none">{m.value}</div>
            <div className="font-display font-bold text-sm uppercase tracking-[0.14em] text-slate-200">{m.label}</div>
            <p className="text-xs text-slate-400 leading-relaxed">{m.detail}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function GalleryPreview() {
  const { events } = useData();
  return (
    <Section id="gallery-preview">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageHeader as="h2" align="left" eyebrow="Visual archive" title="Media &" accent="Highlights">
          Moments from galas, expos and cultural nights, curated by the Media &amp; Marketing wing.
        </PageHeader>
        <Link to="/gallery" className={ghostButton}>Open gallery <ArrowRight className="w-4 h-4" /></Link>
      </div>
      <Gallery events={events} limit={6} />
    </Section>
  );
}

const CATEGORY_TONE = { Urgent: 'bad', Recruitment: 'bright', Events: 'steel', General: 'neutral' };

export function Announcements({ limit = 3 }) {
  const { dispatches } = useData();
  return (
    <Section id="notices">
      <PageHeader as="h2" eyebrow="Official notices" title="Announcements &" accent="Notices">
        Decisions from the core committee, recruitment phases and campus alerts.
      </PageHeader>
      <div className="grid md:grid-cols-3 gap-5">
        {dispatches.slice(0, limit).map((d) => (
          <article key={d.id} className="glass-card rounded-3xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Pill tone={CATEGORY_TONE[d.category] || 'neutral'}>{d.category}</Pill>
              <span className="text-[10px] tracking-[0.18em] uppercase text-slate-500 tabular-nums">{d.date}</span>
            </div>
            <h3 className="font-display font-bold text-white leading-snug">{d.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed flex-1">{d.body}</p>
            <div className="text-[11px] text-slate-500">By {d.author}</div>
            {d.link && (
              <Link to={d.link.to} className="text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:underline underline-offset-4 inline-flex items-center gap-1.5">
                {d.link.label} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}

export function LeadershipPreview() {
  const { team } = useData();
  const president = team.find((g) => /president/i.test(g.category))?.members?.[0];
  const directors = team.find((g) => /director/i.test(g.category))?.members || [];
  return (
    <Section id="leadership">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageHeader as="h2" align="left" eyebrow="Command & governance" title="Meet the" accent="Core">
          The president and the five wing directors. Every appointment is earned through work on record.
        </PageHeader>
        <Link to="/team" className={ghostButton}>Full team &amp; hierarchy <ArrowRight className="w-4 h-4" /></Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[president, ...directors].filter(Boolean).map((p, i) => (
          <div key={p.name} className={`glass-card rounded-3xl p-5 flex items-center gap-4 ${i === 0 ? 'sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:flex-col lg:text-center lg:justify-center' : ''}`}>
            <img src={p.avatar} alt="" className={`${i === 0 ? 'w-16 h-16 lg:w-28 lg:h-28' : 'w-14 h-14'} rounded-full object-cover grayscale border border-white/20 shrink-0`} />
            <div className="min-w-0">
              <div className="text-[10px] tracking-[0.22em] uppercase text-slate-500">{i === 0 ? 'President' : p.wing}</div>
              <div className="font-display font-bold text-white truncate">{p.name}</div>
              <div className="text-xs text-slate-400 truncate">{p.role}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function JoinSection() {
  const { platformSwitches } = useData();
  return (
    <>
      <Section id="join">
        <div className="glass-panel rounded-[2rem] p-8 sm:p-14 grid lg:grid-cols-[1.1fr_1fr] gap-10 [&>*]:min-w-0 items-center overflow-hidden relative">
          <div className="space-y-5">
            <div className="flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase text-slate-400">
              <Sparkle className="w-3 h-3 text-white" /> Join the constellation
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white leading-tight">
              Join <span className="heading-accent">ORION</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
              Recruitment runs every semester across all five wings. Seats are won through auditions, portfolios and interviews with the wing panels. Sign in with your REVA Microsoft account to apply and book a slot.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/recruitment" className={primaryButton}>
                {platformSwitches.recruitmentOpen ? 'Apply for recruitment' : 'Recruitment details'} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/about" className={ghostButton}>Why ORION</Link>
            </div>
          </div>
          <blockquote className="relative border-l border-white/30 pl-6 sm:pl-8 space-y-4">
            <div className="text-[10px] tracking-[0.35em] uppercase text-slate-500">The induction creed</div>
            <p className="font-serif italic text-xl sm:text-2xl text-slate-100 leading-relaxed">“{INDUCTION_CREED}”</p>
          </blockquote>
        </div>
      </Section>
      <ContactSection />
    </>
  );
}
