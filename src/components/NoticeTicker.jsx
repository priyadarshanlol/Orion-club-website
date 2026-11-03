import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Bell, X, Sparkles, ChevronRight } from 'lucide-react';

export default function NoticeTicker() {
  const { noticeTicker } = useData();
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const noticesList = noticeTicker && noticeTicker.length > 0 ? noticeTicker : ['Welcome to Club ORION 2026!'];

  if (!isVisible) return null;

  const nextNotice = () => {
    setCurrentIndex((prev) => (prev + 1) % noticesList.length);
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-cyan-500/10 to-amber-500/20 border-b border-amber-500/30 text-xs sm:text-sm text-slate-200 py-2 px-4 relative z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/40 text-[10px] tracking-wider uppercase shrink-0 animate-pulse">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Notice
          </span>
          <p className="truncate font-medium text-slate-200 cursor-pointer hover:text-amber-300 transition-colors" onClick={nextNotice}>
            {noticesList[currentIndex % noticesList.length]}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={nextNotice}
            className="hidden sm:flex items-center gap-1 text-[11px] text-amber-400/80 hover:text-amber-300 transition-colors"
            title="Next Notice"
          >
            <span>Next</span>
            <ChevronRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800/60"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
