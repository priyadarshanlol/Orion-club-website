import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import Sparkle from './Sparkle';

// First-visit choice: browse with the ambient soundscape or in silence.
export default function SoundPrompt() {
  const { promptOpen, choose, supported } = useSound();
  if (!supported) return null;

  return (
    <AnimatePresence>
      {promptOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sound-prompt-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass-panel rounded-[2rem] max-w-md w-full p-8 text-center space-y-6"
          >
            <div className="relative mx-auto w-16 h-16 grid place-items-center">
              <span className="absolute inset-0 rounded-full border border-white/30 animate-pulse-glow" />
              <span className="absolute inset-[-10px] rounded-full border border-dashed border-white/15 animate-orbit" />
              <Sparkle className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-2">
              <div className="text-[10px] tracking-[0.35em] uppercase text-slate-500">The ORION soundscape</div>
              <h2 id="sound-prompt-title" className="font-display font-extrabold text-2xl text-white">
                Browse with <span className="heading-accent">sound?</span>
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                “Orion’s Belt” is our own score: three bell tones for the three belt stars, a slow pad, a twinkling arpeggio and the odd shooting star. You can mute it or change the volume from the top bar or the menu at any time.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => choose(true)}
                className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-white text-slate-950 hover:shadow-[0_0_40px_-8px_rgba(255,255,255,0.8)] transition-shadow"
              >
                <Volume2 className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-[0.16em]">Play sound</span>
              </button>
              <button
                onClick={() => choose(false)}
                className="flex flex-col items-center gap-1.5 p-4 rounded-2xl border border-white/20 text-slate-200 hover:border-white/60"
              >
                <VolumeX className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-[0.16em]">Stay silent</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
