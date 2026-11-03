import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, Edit3 } from 'lucide-react';
import orionMark from '../assets/orion-mark.png';
import { motion, AnimatePresence } from 'framer-motion';
import UserProfileModal from './UserProfileModal';
import MicrosoftAuthModal, { MicrosoftLogo } from './MicrosoftAuthModal';

export default function Navbar({ isAuthOpen, onOpenAuth, onCloseAuth }) {
  const { 
    currentUser, 
    logout 
  } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalAuthModal, setInternalAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const showAuthModal = isAuthOpen !== undefined ? isAuthOpen : internalAuthModal;
  const handleOpenAuth = onOpenAuth || (() => setInternalAuthModal(true));
  const handleCloseAuth = onCloseAuth || (() => setInternalAuthModal(false));

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'The Wings', href: '#wings' },
    { name: 'Member Hub', href: '#club-management', badge: 'Scores & 3-Flags' },
    { name: 'Team & Tree', href: '#team' },
    { name: 'Events', href: '#events' },
    { name: 'Recruitment 2026', href: '#recruitment' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#050608]/55 backdrop-blur-xl border-b border-white/[0.07] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#hero" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_0_24px_-4px_rgba(255,255,255,0.55)] group-hover:shadow-[0_0_32px_-2px_rgba(255,255,255,0.8)] transition-shadow">
                <img src={orionMark} alt="ORION" className="w-6 h-6 object-contain invert group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-extrabold text-lg tracking-[0.28em] text-white">ORION</span>
                <span className="mt-1 whitespace-nowrap text-[9px] text-slate-400 font-medium tracking-[0.32em] uppercase">Earned not favoured</span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden xl:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative px-3 py-2 text-[11px] whitespace-nowrap font-semibold uppercase tracking-[0.1em] text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/[0.05] flex items-center gap-1.5"
                >
                  {link.name}
                  {link.badge && (
                    <span className="hidden 2xl:inline bg-white text-[8px] font-black tracking-normal text-slate-950 px-1.5 py-0.5 rounded-full uppercase">
                      {link.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>

            {/* Auth Actions */}
            <div className="hidden md:flex items-center gap-2.5">
              {currentUser ? (
                <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 rounded-full py-1.5 px-3">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2 hover:opacity-85 transition-opacity"
                    title="Click to edit student profile"
                  >
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      className="w-7 h-7 rounded-full object-cover border border-amber-400/50"
                    />
                    <div className="flex flex-col text-left pr-1">
                      <span className="text-xs font-semibold text-slate-100 max-w-[120px] truncate flex items-center gap-1">
                        {currentUser.displayName}
                        <Edit3 className="w-3 h-3 text-amber-400" />
                      </span>
                      <span className="text-[10px] text-amber-300 font-medium flex items-center gap-1">
                        <span>{currentUser.position || (currentUser.isMember ? 'Club Member' : 'Visitor')}</span>
                        {currentUser.wing && currentUser.position && !currentUser.position.toLowerCase().includes('visitor') && (
                          <span className="text-slate-400 font-mono text-[9px]">({currentUser.wing})</span>
                        )}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={logout}
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors ml-1"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAuth}
                    className="flex items-center gap-2 px-4 py-2.5 text-[11px] whitespace-nowrap font-bold uppercase tracking-[0.12em] text-slate-950 bg-white hover:bg-slate-100 rounded-full shadow-[0_0_24px_-6px_rgba(255,255,255,0.6)] transition-all hover:scale-105 active:scale-95"
                  >
                    <MicrosoftLogo className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>

                  <button
                    onClick={handleOpenAuth}
                    className="text-[11px] whitespace-nowrap text-slate-400 hover:text-white underline decoration-white/30 py-1 px-2"
                  >
                    Student Sign-Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex xl:hidden items-center gap-2">
              {currentUser && (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-7 h-7 rounded-full border border-cyan-400"
                />
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden bg-[#050608]/95 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3"
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-900 rounded-lg"
                >
                  {link.name}
                </a>
              ))}

              <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                {currentUser ? (
                  <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-amber-500/30">
                    <div className="flex items-center gap-2">
                      <img src={currentUser.photoURL} className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="text-sm font-semibold text-white">{currentUser.displayName}</div>
                        <div className="text-xs text-amber-300 font-medium">
                          {currentUser.position || 'Visitor'} {currentUser.wing && currentUser.position && !currentUser.position.toLowerCase().includes('visitor') ? `(${currentUser.wing})` : ''}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="px-3 py-1.5 text-xs text-rose-400 bg-rose-500/10 rounded-lg border border-rose-500/20"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleOpenAuth();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-full shadow-lg"
                    >
                      <MicrosoftLogo className="w-4 h-4" />
                      <span>Sign In with Microsoft (@reva.edu.in)</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Microsoft 365 Azure AD Styled Authentication Modal */}
      <MicrosoftAuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuth}
      />

      {/* Profile & Photo Edit Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
}
