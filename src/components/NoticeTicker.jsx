import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { X, Sparkles } from 'lucide-react';

// Notice bar: every update slides across in one continuous news-ticker loop,
// so the full text of each notice is seen, on phones too. Hover or touch pauses it.
export default function NoticeTicker() {
  const { noticeTicker } = useData();
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;

  const notices = noticeTicker && noticeTicker.length > 0 ? noticeTicker : ['Welcome to ORION 2026!'];
  // speed stays readable however many notices there are (about 70px per second)
  const chars = notices.join('').length + notices.length * 6;
  const duration = Math.max(18, chars * 0.12);

  const strip = (hidden) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {notices.map((n, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="font-medium text-slate-200">{n}</span>
          <span className="mx-6 text-white/40">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="border-b border-white/10 bg-gradient-to-r from-white/[0.07] via-white/[0.03] to-white/[0.07] text-xs sm:text-sm text-slate-200 py-2 px-4 relative z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <span className="flex items-center gap-1 bg-white/10 text-white font-semibold px-2 py-0.5 rounded-full border border-white/25 text-[10px] tracking-wider uppercase shrink-0">
          <Sparkles className="w-3 h-3" />
          Notice
        </span>
        <div className="notice-marquee relative flex-1 min-w-0 overflow-hidden" role="marquee" aria-label={notices.join('. ')}>
          <div className="notice-track flex w-max" style={{ animationDuration: `${duration}s` }}>
            {strip(false)}
            {strip(true)}
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="shrink-0 text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
          aria-label="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
