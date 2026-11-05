import React, { useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Lock, Volume2, VolumeX, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { homePortalFor, portalLabelFor } from '../lib/roles';
import { NAV_LINKS } from './Navbar';
import Sparkle from './Sparkle';

// Full navigation drawer: every page, the soundscape mixer and the signed-in user card.
export default function MenuDrawer({ open, onClose }) {
  const { currentUser, logout } = useAuth();
  const sound = useSound();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const links = [{ name: 'Home', to: '/' }, ...NAV_LINKS, { name: 'Member Spotlight', to: '/spotlight' }, { name: 'Connect with ORION', to: '/contact' }];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            className="fixed top-0 right-0 bottom-0 z-[61] w-full max-w-sm glass-panel !rounded-none border-y-0 border-r-0 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            aria-label="Site menu"
          >
            <div className="flex items-center justify-between px-6 h-20 border-b border-white/[0.07]">
              <span className="flex items-center gap-2 text-[11px] tracking-[0.35em] uppercase text-slate-400">
                <Sparkle className="w-3 h-3 text-white" /> Navigation
              </span>
              <button onClick={onClose} className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
              <nav className="space-y-0.5">
                {links.map((l, i) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-2xl font-display font-bold text-lg tracking-wide transition-colors ${
                        isActive ? 'bg-white text-slate-950' : 'text-slate-200 hover:bg-white/[0.06]'
                      }`
                    }
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-[10px] opacity-50 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                      {l.name}
                    </span>
                    {l.locked && <Lock className="w-4 h-4 opacity-60" />}
                  </NavLink>
                ))}
              </nav>

              {sound.supported && (
                <div className="glass-card rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500">Soundtrack · Orion’s Belt</div>
                      <div className="text-sm font-semibold text-white">{sound.enabled ? 'Playing' : 'Muted'}</div>
                    </div>
                    <button
                      onClick={sound.toggle}
                      className="p-2.5 rounded-full border border-white/20 hover:border-white text-white"
                      aria-label={sound.enabled ? 'Mute' : 'Play'}
                    >
                      {sound.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                  </div>
                  <label className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="uppercase tracking-[0.2em]">Vol</span>
                    <input
                      id="menu-volume"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={sound.volume}
                      onChange={(e) => sound.setVolume(parseFloat(e.target.value))}
                      className="flex-1 accent-white"
                    />
                    <span className="tabular-nums w-9 text-right">{Math.round(sound.volume * 100)}%</span>
                  </label>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/[0.07]">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <img src={currentUser.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white truncate">{currentUser.displayName}</div>
                    <Link to={homePortalFor(currentUser)} onClick={onClose} className="text-[11px] text-slate-400 hover:text-white underline underline-offset-4">
                      Open {portalLabelFor(currentUser).toLowerCase()}
                    </Link>
                  </div>
                  <button
                    onClick={() => { logout(); onClose(); navigate('/'); }}
                    className="p-2 rounded-full text-rose-300 hover:bg-rose-500/10"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link to="/portal" onClick={onClose} className="block text-center px-4 py-3 rounded-full bg-white text-slate-950 text-xs font-bold uppercase tracking-[0.18em]">
                  Sign in / Sign up
                </Link>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
