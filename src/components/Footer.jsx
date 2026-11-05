import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ShieldCheck } from 'lucide-react';
import orionMark from '../assets/orion-mark.png';
import Sparkle from './Sparkle';

export default function Footer() {

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 bg-gradient-to-b from-transparent to-black/80 border-t border-white/[0.07] text-slate-400 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-3 pb-10">
          <p className="font-serif italic text-3xl sm:text-5xl text-starlight">Earned, not favoured.</p>
          <div className="star-rule max-w-xs mx-auto"><Sparkle className="w-3 h-3" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & REVA Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_0_24px_-6px_rgba(255,255,255,0.6)]">
                <img src={orionMark} alt="ORION" className="w-6 h-6 object-contain invert" />
              </div>
              <div className="leading-none">
                <span className="block font-extrabold text-xl tracking-[0.3em] text-white font-display">ORION</span>
                <span className="block mt-1 text-[9px] tracking-[0.35em] uppercase text-slate-500">Earned not favoured</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              The premier multi-dimensional student organization at REVA University, Bengaluru. Fostering technical innovation, internal & external affairs, cultural performing arts, discipline & operations, and digital media.
            </p>

            <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Rukmini Knowledge Park, Kattigenahalli, Yelahanka, Bengaluru – 560064</span>
            </div>
          </div>

          {/* Col 2: The 5 Wings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display">The 5 Wings</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/wings/discipline" className="hover:text-amber-400 transition-colors">Wing 01: Discipline Wing</Link></li>
              <li><Link to="/wings/internal-external" className="hover:text-amber-400 transition-colors">Wing 02: Internal & External Wing</Link></li>
              <li><Link to="/wings/cultural" className="hover:text-amber-400 transition-colors">Wing 03: Cultural Wing</Link></li>
              <li><Link to="/wings/technical" className="hover:text-amber-400 transition-colors">Wing 04: Technical Wing</Link></li>
              <li><Link to="/wings/media" className="hover:text-amber-400 transition-colors">Wing 05: Media & Marketing Wing</Link></li>
            </ul>
          </div>

          {/* Col 3: Portal Links & Back to Top */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display font-bold">Portal Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/portal" className="text-amber-400 font-semibold hover:underline transition-colors">Member, committee & discipline portals</Link></li>
              <li><Link to="/gallery" className="hover:text-amber-400 transition-colors">Media Gallery</Link></li>
              <li><Link to="/about" className="hover:text-amber-400 transition-colors">About ORION</Link></li>
              <li><Link to="/team" className="hover:text-amber-400 transition-colors">Meet ORION: directory</Link></li>
              <li><Link to="/hackathon" className="hover:text-amber-400 transition-colors">Aarambh 2026 hackathon</Link></li>
              <li><Link to="/spotlight" className="hover:text-amber-400 transition-colors">Member Spotlight</Link></li>
              <li><Link to="/events" className="hover:text-amber-400 transition-colors">Upcoming events & registration</Link></li>
              <li><Link to="/recruitment" className="hover:text-amber-400 transition-colors">Recruitment 2026 Portal</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition-colors">Connect with ORION</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 Club ORION, REVA University. All Rights Reserved. Restricted to <code className="text-amber-400 font-mono">@reva.edu.in</code>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
