import React from 'react';
import { Globe, HeartHandshake, ShieldCheck, Code2, Camera, Megaphone, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap = {
  Globe: Globe,
  HeartHandshake: HeartHandshake,
  ShieldCheck: ShieldCheck,
  Code2: Code2,
  Camera: Camera,
  Megaphone: Megaphone
};

export default function WingCard({ wing, onClick, isSelected, isActive }) {
  const selected = isSelected ?? isActive;
  const IconComponent = iconMap[wing.iconName] || Globe;

  return (
    <motion.div
      whileHover={{ y: -8, rotateX: 6, rotateY: -6, scale: 1.02 }}
      style={{ transformPerspective: 900 }}
      onClick={onClick}
      className={`glass-card rounded-3xl p-6 cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col justify-between border ${
        selected 
          ? 'border-amber-400 shadow-2xl shadow-amber-500/20 bg-slate-900/90' 
          : 'border-slate-800 hover:border-amber-500/40 hover:shadow-xl'
      }`}
    >
      {/* Background Accent Gradient */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-20 pointer-events-none"
        style={{ backgroundColor: '#dfe6ff' }}
      />

      <div className="space-y-4 relative z-10">
        {/* Header: Wing Code & Badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-extrabold text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            WING {wing.code}
          </span>
          <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-amber-400 shadow-md">
            <IconComponent className="w-5 h-5" />
          </div>
        </div>

        {/* Wing Title & Tagline */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-100 font-display tracking-wide group-hover:text-amber-400 transition-colors">
            {wing.name}
          </h3>
          <p className="text-xs font-semibold text-amber-400/90">
            {wing.tagline}
          </p>
        </div>

        {/* Mission Excerpt */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
          {wing.mission}
        </p>
      </div>

      {/* Footer Details CTA */}
      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between relative z-10 text-xs font-bold text-slate-300 hover:text-amber-300">
        <span>Explore Wing Domain</span>
        <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
        </div>
      </div>
    </motion.div>
  );
}
