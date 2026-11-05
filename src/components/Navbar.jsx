import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Lock, Menu, Volume2, VolumeX, LogOut, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { homePortalFor, portalLabelFor } from '../lib/roles';
import orionMark from '../assets/orion-mark.png';

export const NAV_LINKS = [
  { name: 'About', to: '/about' },
  { name: 'Wings', to: '/wings' },
  { name: 'Hackathon', to: '/hackathon' },
  { name: 'Events', to: '/events' },
  { name: 'Meet ORION', to: '/team' },
  { name: 'Gallery', to: '/gallery' },
  { name: 'Recruitment', to: '/recruitment' },
  { name: 'Discipline', to: '/discipline', locked: true },
];

export default function Navbar({ onOpenMenu }) {
  const { currentUser, logout } = useAuth();
  const sound = useSound();
  const navigate = useNavigate();
  const [userMenu, setUserMenu] = useState(false);

  const linkClass = ({ isActive }) =>
    `relative px-2.5 py-2 text-[11px] whitespace-nowrap font-semibold uppercase tracking-[0.12em] rounded-full transition-colors flex items-center gap-1.5 ${
      isActive ? 'text-white bg-white/[0.08]' : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-[#050608]/55 backdrop-blur-xl border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_0_24px_-4px_rgba(255,255,255,0.55)] group-hover:shadow-[0_0_32px_-2px_rgba(255,255,255,0.8)] transition-shadow">
              <img src={orionMark} alt="" className="w-6 h-6 object-contain invert group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-extrabold text-lg tracking-[0.28em] text-white">ORION</span>
              <span className="mt-1 whitespace-nowrap text-[9px] text-slate-400 font-medium tracking-[0.32em] uppercase hidden sm:block">Earned not favoured</span>
            </div>
          </Link>

          <div className="hidden xl:flex items-center gap-0.5">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.name}
                {l.locked && <Lock className="w-3 h-3 opacity-60" />}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {sound.supported && (
              <button
                onClick={sound.toggle}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-full border text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                  sound.enabled ? 'border-white/40 text-white bg-white/[0.06]' : 'border-white/10 text-slate-500 hover:text-white'
                }`}
                aria-pressed={sound.enabled}
                title={sound.enabled ? 'Mute the soundscape' : 'Play the Orion’s Belt soundtrack'}
              >
                {sound.enabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden md:inline xl:hidden">{sound.enabled ? 'Sound on' : 'Muted'}</span>
                {sound.enabled && (
                  <span className="flex items-end gap-[2px] h-3" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-[2px] bg-white animate-pulse-glow" style={{ height: `${50 + i * 25}%`, animationDelay: `${i * 0.3}s`, animationDuration: '1.4s' }} />
                    ))}
                  </span>
                )}
              </button>
            )}

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-white/15 hover:border-white/40 bg-black/30"
                  aria-expanded={userMenu}
                >
                  <img src={currentUser.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />
                  <span className="hidden md:block text-xs font-semibold text-slate-100 max-w-[110px] truncate">{currentUser.displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <AnimatePresence>
                  {userMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl p-2 z-50"
                      onMouseLeave={() => setUserMenu(false)}
                    >
                      <div className="px-3 py-2.5 border-b border-white/[0.07] mb-1">
                        <div className="text-sm font-semibold text-white truncate">{currentUser.displayName}</div>
                        <div className="text-[11px] text-slate-400 truncate">{currentUser.position} · {currentUser.wing}</div>
                      </div>
                      <button
                        onClick={() => { setUserMenu(false); navigate(homePortalFor(currentUser)); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/[0.06]"
                      >
                        Open {portalLabelFor(currentUser).toLowerCase()}
                      </button>
                      <button
                        onClick={() => { setUserMenu(false); logout(); navigate('/'); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/10 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/portal"
                className="flex items-center gap-2 px-4 py-2.5 text-[11px] whitespace-nowrap font-bold uppercase tracking-[0.12em] text-slate-950 bg-white hover:bg-slate-100 rounded-full shadow-[0_0_24px_-6px_rgba(255,255,255,0.6)] transition-all"
              >
                Sign in
              </Link>
            )}

            <button
              onClick={onOpenMenu}
              className="flex items-center gap-2 px-3 py-2.5 rounded-full border border-white/15 hover:border-white/40 text-slate-200 text-[11px] font-semibold uppercase tracking-[0.12em]"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
