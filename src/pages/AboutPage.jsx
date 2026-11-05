import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ABOUT_PILLARS, CREST_PARTS } from '../lib/content';
import { useData } from '../context/DataContext';
import { PageHeader, PageShell, primaryButton, ghostButton } from '../components/ui';
import orionMark from '../assets/orion-mark.png';
import Sparkle from '../components/Sparkle';

export default function AboutPage() {
  const { wings } = useData();
  return (
    <PageShell className="space-y-24">
      <PageHeader eyebrow="About ORION · REVA University" title="Earned," accent="not favoured.">
        ORION started as a challenge to the usual college club: no honorary titles, no empty committee lists, no seats kept for friends.
        Every position, project lead and stage credit at ORION is proven through work the whole club can see.
      </PageHeader>

      <section className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative mx-auto w-[min(80vw,380px)] aspect-square">
          <div className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-orbit" />
          <div className="absolute inset-[12%] rounded-full border border-white/10" />
          <div className="absolute inset-[24%] grid place-items-center">
            <img src={orionMark} alt="The ORION crest" className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]" />
          </div>
          <Sparkle className="absolute top-[6%] left-1/2 -translate-x-1/2 w-5 h-5 text-white animate-twinkle" />
          <Sparkle className="absolute bottom-[6%] left-1/2 -translate-x-1/2 w-4 h-4 text-white animate-twinkle" style={{ animationDelay: '1.4s' }} />
        </div>
        <div className="space-y-8">
          <PageHeader as="h2" align="left" eyebrow="Insignia" title="Anatomy of the" accent="crest" />
          <ol className="space-y-6">
            {CREST_PARTS.map((p, i) => (
              <li key={p.title} className="flex gap-5">
                <span className="font-serif text-3xl text-white/50 leading-none tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-display font-bold text-white">{p.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{p.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="space-y-10">
        <PageHeader as="h2" eyebrow="What sets us apart" title="Why members choose" accent="ORION" />
        <div className="grid md:grid-cols-3 gap-5">
          {ABOUT_PILLARS.map((p) => (
            <div key={p.title} className="glass-card rounded-3xl p-7 space-y-3">
              <Sparkle className="w-4 h-4 text-white" />
              <h3 className="font-display font-bold text-lg text-white">{p.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-10">
        <PageHeader as="h2" eyebrow="Five wings, five stars" title="One" accent="constellation" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {wings.map((w) => (
            <Link key={w.id} to={`/wings/${w.id}`} className="glass-card rounded-2xl p-5 hover:-translate-y-1 space-y-2">
              <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500">Wing {w.code}</div>
              <div className="font-display font-bold text-white">{w.name}</div>
              <div className="text-xs text-slate-400">{w.tagline}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-[2rem] p-10 sm:p-14 text-center space-y-6">
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white">
          Ready to <span className="heading-accent">earn it?</span>
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">Explore the five wings, or sign in with your REVA account to reach your portal.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/wings" className={primaryButton}>Explore the wings <ArrowRight className="w-4 h-4" /></Link>
          <Link to="/portal" className={ghostButton}>Choose a portal</Link>
        </div>
      </section>
    </PageShell>
  );
}
