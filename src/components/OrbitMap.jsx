import React from 'react';
import { Globe, HeartHandshake, ShieldCheck, Code2, Megaphone, Sparkles } from 'lucide-react';
import orionMark from '../assets/orion-mark.png';
import { WING_CONSTELLATIONS } from '../lib/content';

const ICONS = { Globe, HeartHandshake, ShieldCheck, Code2, Megaphone, Sparkles };

// The five wings in orbit around the ORION core. Selecting a station selects that
// wing; the selection is shared with the Constellation view.
export default function OrbitMap({ wings, selectedId, onSelect }) {
  const count = wings.length;

  return (
    <div className="relative mx-auto w-full max-w-[640px] aspect-square">
      {/* orbit rings, tilted slightly for depth */}
      <div className="absolute inset-0 [perspective:1200px]">
        <div className="absolute inset-0 [transform:rotateX(18deg)]">
          {[0.92, 0.66, 0.4].map((s, i) => (
            <div
              key={s}
              className={`absolute rounded-full border ${i === 1 ? 'border-white/20 border-dashed' : 'border-white/10'}`}
              style={{ inset: `${((1 - s) / 2) * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* rotating station ring */}
      <div className="absolute inset-0 animate-orbit" style={{ animationDuration: '140s' }}>
        {wings.map((w, i) => {
          const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
          const r = 39;
          const x = 50 + Math.cos(angle) * r;
          const y = 50 + Math.sin(angle) * r;
          const Icon = ICONS[w.iconName] || Globe;
          const chart = WING_CONSTELLATIONS[w.id];
          return (
            <div key={w.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
              {/* counter-rotate so labels stay upright */}
              <div className="animate-orbit-reverse" style={{ animationDuration: '140s', animationDirection: 'reverse' }}>
                <button
                  onClick={() => onSelect?.(w.id)}
                  className="group flex flex-col items-center gap-2 focus-visible:outline-none"
                  aria-label={`Select ${w.name}`}
                  aria-pressed={selectedId === w.id}
                >
                  <span className={`relative grid place-items-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border backdrop-blur-md transition-all group-hover:border-white group-hover:shadow-[0_0_40px_-6px_rgba(255,255,255,0.8)] group-focus-visible:border-white ${
                    selectedId === w.id
                      ? 'bg-white text-slate-950 border-white shadow-[0_0_50px_-6px_rgba(255,255,255,0.9)]'
                      : 'bg-black/60 text-white border-white/20 shadow-[0_0_30px_-10px_rgba(255,255,255,0.6)]'
                  }`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </span>
                  <span className="text-center leading-tight">
                    <span className="block font-display font-bold text-[10px] sm:text-xs tracking-[0.12em] text-white max-w-[6.5rem] sm:max-w-none sm:whitespace-nowrap mx-auto">{w.name}</span>
                    <span className="block text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-slate-500 whitespace-nowrap">{chart?.star}</span>
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* the core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white grid place-items-center shadow-[0_0_80px_-10px_rgba(255,255,255,0.75)]">
          <img src={orionMark} alt="" className="w-1/2 h-1/2 object-contain invert" />
          <span className="absolute inset-[-14%] rounded-full border border-white/30 animate-pulse-glow" />
        </div>
        <span className="text-[10px] tracking-[0.4em] uppercase text-slate-400">Core</span>
      </div>
    </div>
  );
}
