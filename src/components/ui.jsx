import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkle from './Sparkle';

// Section/page heading in the poster style: tracked eyebrow, bold sans title with a serif accent.
export function PageHeader({ eyebrow, title, accent, after = '', children, align = 'center', as = 'h1' }) {
  const Heading = as;
  const centered = align === 'center';
  return (
    <div className={`space-y-4 ${centered ? 'text-center max-w-3xl mx-auto' : 'max-w-3xl'}`}>
      {eyebrow && (
        <div className={`flex items-center gap-3 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400 ${centered ? 'justify-center' : ''}`}>
          <Sparkle className="w-3 h-3 text-white" />
          <span>{eyebrow}</span>
        </div>
      )}
      <Heading className="font-display font-extrabold text-3xl sm:text-5xl text-slate-100 leading-tight text-balance">
        {title}
        {accent && (
          <>
            {' '}
            <span className="heading-accent">{accent}</span>
          </>
        )}
        {after && <> {after}</>}
      </Heading>
      {children && <div className="text-sm sm:text-base text-slate-400 leading-relaxed">{children}</div>}
    </div>
  );
}

export function PageShell({ children, className = '' }) {
  return <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-14 ${className}`}>{children}</div>;
}

// Segmented tab bar
export function Tabs({ tabs, value, onChange, size = 'md', className = '' }) {
  return (
    <div role="tablist" className={`inline-flex flex-wrap gap-1 p-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-md ${className}`}>
      {tabs.map((t) => {
        const id = typeof t === 'string' ? t : t.id;
        const label = typeof t === 'string' ? t : t.label;
        const Icon = typeof t === 'string' ? null : t.icon;
        const active = value === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-[0.12em] transition-all whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
              size === 'sm' ? 'px-3 py-1.5 text-[10px]' : 'px-4 py-2 text-[11px]'
            } ${active ? 'bg-white text-slate-950 shadow-[0_0_20px_-6px_rgba(255,255,255,0.7)]' : 'text-slate-400 hover:text-white'}`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function StatTile({ label, value, sub, icon: Icon }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.22em]">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-slate-300" />}
      </div>
      <div className="font-serif text-4xl text-white leading-none tabular-nums">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-2">{sub}</div>}
    </div>
  );
}

const PILL_TONES = {
  neutral: 'border-white/15 text-slate-300 bg-white/[0.04]',
  bright: 'border-white/40 text-white bg-white/10',
  good: 'border-emerald-400/30 text-emerald-300 bg-emerald-400/10',
  warn: 'border-yellow-200/30 text-yellow-200 bg-yellow-200/10',
  bad: 'border-rose-400/30 text-rose-300 bg-rose-400/10',
  steel: 'border-cyan-400/30 text-cyan-300 bg-cyan-400/10',
};

export function Pill({ children, tone = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap ${PILL_TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

// The 3-flag standing as three small flags
export function FlagDots({ flags = 3, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-label={`${flags} of 3 flags remaining`} title={`${flags} of 3 flags remaining`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rotate-45 ${i < flags ? (flags === 1 ? 'bg-rose-400' : flags === 2 ? 'bg-yellow-200' : 'bg-white') : 'border border-white/25'}`}
        />
      ))}
    </span>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="glass-panel rounded-3xl p-10 text-center space-y-3">
      <Sparkle className="w-6 h-6 text-white mx-auto animate-twinkle" />
      <h3 className="font-display font-bold text-lg text-white">{title}</h3>
      {children && <p className="text-sm text-slate-400 max-w-md mx-auto">{children}</p>}
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Rendered on <body> so a tilted card or panel never traps the overlay
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className={`glass-panel rounded-3xl w-full ${wide ? 'max-w-4xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3 border-b border-white/[0.07]">
              <h2 className="font-display font-bold text-white text-base">{title}</h2>
              <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export const inputClass =
  'w-full rounded-xl bg-black/40 border border-white/10 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-white/50 transition-colors';

export const labelClass = 'block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1.5';

export const primaryButton =
  'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-slate-950 text-xs font-bold uppercase tracking-[0.18em] shadow-[0_0_30px_-8px_rgba(255,255,255,0.6)] hover:shadow-[0_0_44px_-6px_rgba(255,255,255,0.8)] transition-all disabled:opacity-40 disabled:cursor-not-allowed';

export const ghostButton =
  'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 hover:border-white/60 bg-white/[0.03] hover:bg-white/[0.07] text-slate-100 text-xs font-semibold uppercase tracking-[0.18em] transition-all';
