import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Orbit, Sparkles as SparklesIcon, Lock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { WING_CONSTELLATIONS } from '../lib/content';
import WingConstellation from './WingConstellation';
import OrbitMap from './OrbitMap';
import { PageHeader, Tabs, primaryButton, ghostButton } from './ui';

// Home/Wings showcase: step through each wing's constellation, or see all five in orbit.
export default function WingsShowcase({ headingAs = 'h2' }) {
  const { wings } = useData();
  const [view, setView] = useState('constellations');
  const [index, setIndex] = useState(0);
  const wing = wings[index] || wings[0];
  const chart = WING_CONSTELLATIONS[wing?.id];

  const step = (d) => setIndex((i) => (i + d + wings.length) % wings.length);

  useEffect(() => {
    if (view !== 'constellations') return undefined;
    const onKey = (e) => {
      if (e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!wing) return null;

  return (
    <section id="wings" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <PageHeader as={headingAs} eyebrow="Living constellations" title={`The ${wings.length}`} accent="Wings" after="of ORION">
          Each wing is anchored to a real star of Orion. Step through their star charts, or see all five in orbit around the core.
        </PageHeader>

        <div className="flex justify-center">
          <Tabs
            value={view}
            onChange={setView}
            tabs={[
              { id: 'constellations', label: 'Constellation view', icon: SparklesIcon },
              { id: 'orbit', label: 'Orbit map', icon: Orbit },
            ]}
          />
        </div>

        {view === 'constellations' ? (
          <div className="glass-panel rounded-[2rem] p-5 sm:p-10">
            {/* wing selector */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {wings.map((w, i) => (
                <button
                  key={w.id}
                  onClick={() => setIndex(i)}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase border transition-all ${
                    i === index ? 'bg-white text-slate-950 border-white' : 'border-white/15 text-slate-400 hover:text-white hover:border-white/40'
                  }`}
                >
                  {w.code} · {w.name}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={wing.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                className="grid lg:grid-cols-[1.05fr_1fr] gap-8 [&>*]:min-w-0 lg:gap-14 items-center"
              >
                <div className="relative max-w-[520px] w-full mx-auto">
                  <WingConstellation chart={chart} title={wing.name} animateKey={wing.id} />
                  <p className="text-center text-[10px] tracking-[0.35em] uppercase text-slate-500 mt-2">
                    Star chart · {chart?.star}
                  </p>
                </div>

                <div className="space-y-5 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-slate-400">
                    <span>RA {chart?.ra}</span>
                    <span className="text-slate-600">·</span>
                    <span>Dec {chart?.dec}</span>
                    <span className="text-slate-600">·</span>
                    <span>{chart?.distance}</span>
                  </div>
                  <div className="text-[10px] tracking-[0.3em] uppercase text-slate-500">
                    Wing {wing.code} · {chart?.sector} · {chart?.spectral}
                  </div>
                  <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-white">{wing.name}</h3>
                  <p className="font-serif italic text-lg sm:text-xl text-slate-200">{wing.tagline}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{wing.mission}</p>
                  <ul className="space-y-2">
                    {wing.scope.slice(0, 3).map((s) => (
                      <li key={s} className="flex gap-3 text-sm text-slate-300">
                        <span className="mt-2 w-1.5 h-1.5 rotate-45 bg-white shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link to={`/wings/${wing.id}`} className={primaryButton}>
                      Enter {wing.name}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    {wing.id === 'discipline' && (
                      <Link to="/discipline" className={ghostButton}>
                        <Lock className="w-3.5 h-3.5" />
                        Discipline console
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.07]">
              <button onClick={() => step(-1)} className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-[11px] tracking-[0.3em] text-slate-500 tabular-nums">
                {String(index + 1).padStart(2, '0')} / {String(wings.length).padStart(2, '0')}
              </span>
              <button onClick={() => step(1)} className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-white">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-[2rem] p-5 sm:p-10 space-y-4">
            <p className="text-center text-sm text-slate-400">All five wings in orbit around the ORION core. Select a station to see its wing.</p>
            <OrbitMap wings={wings} selectedId={wing.id} onSelect={(id) => setIndex(Math.max(0, wings.findIndex((w) => w.id === id)))} />
            <div className="flex flex-col items-center gap-3 text-center pt-2">
              <div className="text-[10px] tracking-[0.3em] uppercase text-slate-500">Wing {wing.code} · {chart?.star}</div>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">{wing.name}</h3>
              <p className="font-serif italic text-lg text-slate-300">{wing.tagline}</p>
              <div className="flex flex-wrap justify-center gap-3 pt-1">
                <Link to={`/wings/${wing.id}`} className={primaryButton}>
                  Enter {wing.name} <ArrowRight className="w-4 h-4" />
                </Link>
                <button onClick={() => setView('constellations')} className={ghostButton}>
                  <SparklesIcon className="w-3.5 h-3.5" /> See its constellation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
