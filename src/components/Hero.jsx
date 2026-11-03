import React from 'react';
import { ArrowRight, Layers, Users, Calendar, Award } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import orionMark from '../assets/orion-mark.png';
import Sparkle from './Sparkle';

// Poster-style star chart that frames the logo: dotted orbits, hairline axes, sparkles at the nodes.
function StarChart() {
  const nodes = [
    [200, 40], [200, 360], [40, 200], [360, 200],
    [87, 87], [313, 87], [87, 313], [313, 313],
  ];
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id="axisFade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g stroke="url(#axisFade)" strokeWidth="0.6">
        <line x1="200" y1="-120" x2="200" y2="520" />
        <line x1="-160" y1="200" x2="560" y2="200" />
        <line x1="-40" y1="-40" x2="440" y2="440" />
        <line x1="440" y1="-40" x2="-40" y2="440" />
      </g>
      <g className="animate-orbit" style={{ transformOrigin: '200px 200px' }}>
        <circle cx="200" cy="200" r="160" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" strokeDasharray="1.5 5" />
        <circle cx="360" cy="200" r="2.2" fill="#fff" />
      </g>
      <g className="animate-orbit-reverse" style={{ transformOrigin: '200px 200px' }}>
        <circle cx="200" cy="200" r="190" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="0.6" />
        <rect x="64" y="64" width="4" height="4" fill="#fff" fillOpacity="0.8" />
        <rect x="332" y="332" width="4" height="4" fill="#fff" fillOpacity="0.8" />
      </g>
      <circle cx="200" cy="200" r="122" fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="0.6" strokeDasharray="0.5 3" />
      {nodes.map(([x, y], i) => (
        <rect key={i} x={x - 2} y={y - 2} width="4" height="4" fill="#fff" fillOpacity="0.7" transform={`rotate(45 ${x} ${y})`} />
      ))}
    </svg>
  );
}

export default function Hero() {
  const metrics = [
    { label: 'Specialized Wings', value: '5', unit: 'Wings', sub: 'Nanak, Zayd-Bodhi, Kala-Sanskriti, Arjuna, Media & Marketing', icon: Layers },
    { label: 'Active Members', value: '100+', unit: '', sub: 'Across 12 REVA Schools', icon: Users },
    { label: 'Flagship Events', value: '15+', unit: '', sub: 'Fests, Conclaves & Expos', icon: Calendar },
    { label: 'Campus Impact', value: '3,500+', unit: '', sub: 'Participating Students', icon: Award },
  ];

  // 3D tilt of the emblem following the pointer
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, [-1, 1], [-18, 18]), { stiffness: 80, damping: 18 });
  const rotX = useSpring(useTransform(my, [-1, 1], [14, -14]), { stiffness: 80, damping: 18 });
  const glowX = useTransform(mx, [-1, 1], ['35%', '65%']);
  const glowY = useTransform(my, [-1, 1], ['35%', '65%']);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };

  return (
    <section
      id="hero"
      onMouseMove={onMove}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      className="relative min-h-[calc(100vh-7rem)] flex items-center justify-center pt-10 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-6xl w-full mx-auto text-center relative z-10">
        {/* Emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative mx-auto w-[min(78vw,340px)] aspect-square [perspective:900px]"
        >
          <StarChart />
          <Sparkle className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 text-white animate-twinkle" />
          <Sparkle className="hidden sm:block absolute top-1/2 -left-10 -translate-y-1/2 w-5 h-5 text-white animate-twinkle" style={{ animationDelay: '1.2s' }} />
          <Sparkle className="hidden sm:block absolute top-1/2 -right-10 -translate-y-1/2 w-5 h-5 text-white animate-twinkle" style={{ animationDelay: '2.1s' }} />

          <motion.div
            style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
            className="absolute inset-[22%] flex items-center justify-center"
          >
            <motion.div
              className="absolute inset-[-30%] rounded-full blur-2xl opacity-60"
              style={{
                background: 'radial-gradient(circle, rgba(225,232,250,0.35), transparent 60%)',
                left: glowX, top: glowY, translateX: '-50%', translateY: '-50%', width: '160%', height: '160%',
              }}
            />
            {/* layered copies give the mark real depth when it tilts */}
            <img src={orionMark} alt="" aria-hidden="true" className="absolute w-full h-full object-contain opacity-15 blur-[1px]" style={{ transform: 'translateZ(-40px)' }} />
            <img src={orionMark} alt="" aria-hidden="true" className="absolute w-full h-full object-contain opacity-30" style={{ transform: 'translateZ(-20px)' }} />
            <img
              src={orionMark}
              alt="ORION emblem"
              className="relative w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.45)]"
              style={{ transform: 'translateZ(30px)' }}
            />
          </motion.div>
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35 }}
          className="mt-10 space-y-4"
        >
          <h1 className="font-display font-extrabold leading-none text-[clamp(3.5rem,13vw,9rem)] tracking-[0.06em] pl-[0.06em] text-starlight gold-glow">
            ORION
          </h1>
          <p className="font-display font-semibold text-[11px] sm:text-sm tracking-[0.55em] pl-[0.55em] text-slate-200 uppercase">
            Earned not favoured
          </p>
          <div className="star-rule max-w-md mx-auto pt-2">
            <Sparkle className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-6 space-y-4"
        >
          <p className="font-serif italic text-2xl sm:text-4xl text-slate-100">
            The vision. The minds. The force.
          </p>
          <p className="font-serif text-[11px] sm:text-xs tracking-[0.45em] pl-[0.45em] uppercase text-slate-400">
            Club ORION · REVA University · Bengaluru
          </p>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed pt-2">
            The premier multi-dimensional student organization at REVA University, uniting technical innovation,
            member culture, operational discipline, external outreach and creative media into one constellation.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10"
        >
          <a
            href="#wings"
            className="group relative w-full sm:w-auto overflow-hidden px-8 py-4 text-sm font-bold tracking-[0.2em] uppercase text-slate-950 bg-white rounded-full shadow-[0_0_40px_-8px_rgba(255,255,255,0.6)] hover:shadow-[0_0_60px_-6px_rgba(255,255,255,0.8)] transition-all flex items-center justify-center gap-3"
          >
            <span>Explore the 5 Wings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#team"
            className="w-full sm:w-auto px-8 py-4 text-sm font-semibold tracking-[0.2em] uppercase text-slate-100 rounded-full border border-white/25 hover:border-white/70 bg-white/[0.03] hover:bg-white/[0.07] backdrop-blur-md transition-all flex items-center justify-center gap-3"
          >
            <Sparkle className="w-3 h-3" />
            <span>Meet the Core</span>
          </a>
        </motion.div>

        {/* Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-16 text-left"
        >
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.22em]">{m.label}</span>
                  <Icon className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                </div>
                <div className="font-serif text-4xl sm:text-5xl text-white leading-none">
                  {m.value}
                  {m.unit && <span className="font-display text-xs tracking-[0.3em] uppercase text-slate-400 ml-2">{m.unit}</span>}
                </div>
                <div className="text-xs text-slate-500 mt-2 truncate">{m.sub}</div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <a href="#wings" className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-slate-500 hover:text-white transition-colors">
        <span>Scroll</span>
        <span className="relative block w-px h-10 overflow-hidden bg-white/10">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-white animate-scroll-cue" />
        </span>
      </a>
    </section>
  );
}
