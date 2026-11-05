import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Users, Gavel, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { homePortalFor, isCommitteeUser, isDisciplineUser, isMemberUser, portalLabelFor } from '../lib/roles';
import MicrosoftAuthModal, { MicrosoftLogo } from '../components/MicrosoftAuthModal';
import { PageHeader, PageShell, Pill, primaryButton, ghostButton, EmptyState } from '../components/ui';

const PORTALS = [
  {
    id: 'member',
    to: '/member',
    icon: Users,
    eyebrow: 'Member portal',
    title: 'Members',
    text: 'For ORION members in every wing. See your points, flags, stars and duty hours, your rank on the leaderboard, RSVPs and club notices.',
    who: 'Any REVA student on the ORION roster',
    preview: ['mem_alex_student', 'mem_sneha_warning'],
    allowed: isMemberUser,
  },
  {
    id: 'committee',
    to: '/committee',
    icon: ShieldCheck,
    eyebrow: 'Core committee',
    title: 'Committee console',
    text: 'For directors, secretaries and leads. Publish notices, manage members, venues, events and media, and review the audit trail.',
    who: 'President, directors, secretaries and leads',
    preview: ['mem_aarav_arjuna', 'mem_meera_zayd'],
    allowed: isCommitteeUser,
  },
  {
    id: 'discipline',
    to: '/discipline',
    icon: Gavel,
    eyebrow: 'Discipline Wing proctors',
    title: 'Discipline console',
    text: 'For the Discipline Wing discipline wing. Log commendations and flag removals, track duty rosters and keep the club charter.',
    who: 'Discipline Wing leadership and the President',
    preview: ['mem_nikhil_nanak', 'mem_varun_tej'],
    allowed: isDisciplineUser,
  },
];

export default function PortalPage() {
  const { currentUser, isLiveFirebaseConfigured, signInAsPreviewUser, logout } = useAuth();
  const { clubMembers } = useData();
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();

  const previewAs = (memberId, to) => {
    const member = clubMembers.find((m) => m.id === memberId);
    if (!member) return;
    signInAsPreviewUser(member);
    navigate(to);
  };

  return (
    <PageShell>
      <PageHeader eyebrow="REVA Microsoft sign-in" title="Choose your" accent="portal">
        Sign in with your official @reva.edu.in account. ORION opens the portal your role allows: members, the core committee, or the Discipline Wing discipline wing.
      </PageHeader>

      {currentUser && (
        <div className="glass-panel rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <img src={currentUser.photoURL} alt="" className="w-14 h-14 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500">Signed in</div>
            <div className="font-display font-bold text-white text-lg truncate">{currentUser.displayName}</div>
            <div className="text-xs text-slate-400 truncate">{currentUser.position} · {currentUser.wing} · {currentUser.email}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={homePortalFor(currentUser)} className={primaryButton}>Open {portalLabelFor(currentUser).toLowerCase()} <ArrowRight className="w-4 h-4" /></Link>
            <button onClick={logout} className={ghostButton}>Sign out</button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {PORTALS.map((p) => {
          const Icon = p.icon;
          const allowed = currentUser && p.allowed(currentUser);
          return (
            <article key={p.id} className="glass-card rounded-[2rem] p-7 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-2xl border border-white/20 grid place-items-center text-white"><Icon className="w-5 h-5" /></span>
                {currentUser && (allowed ? <Pill tone="good">Access granted</Pill> : <Pill><Lock className="w-3 h-3" /> Restricted</Pill>)}
              </div>
              <div className="space-y-2">
                <div className="text-[10px] tracking-[0.3em] uppercase text-slate-500">{p.eyebrow}</div>
                <h2 className="font-display font-extrabold text-2xl text-white">{p.title}</h2>
                <p className="text-sm text-slate-400 leading-relaxed">{p.text}</p>
                <p className="text-xs text-slate-500">Who: {p.who}</p>
              </div>

              <div className="mt-auto space-y-3">
                {allowed ? (
                  <Link to={p.to} className={`${primaryButton} w-full`}>Enter <ArrowRight className="w-4 h-4" /></Link>
                ) : !currentUser ? (
                  <button onClick={() => setAuthOpen(true)} className={`${primaryButton} w-full`}>
                    <MicrosoftLogo className="w-3.5 h-3.5" /> Sign in with Microsoft
                  </button>
                ) : (
                  <p className="text-xs text-slate-500">Your current role ({currentUser.position}) does not include this portal. A director can update your position.</p>
                )}

                {!isLiveFirebaseConfigured && (
                  <div className="pt-3 border-t border-white/[0.07] space-y-2">
                    <div className="text-[9px] tracking-[0.25em] uppercase text-slate-500">Preview as a sample member</div>
                    <div className="flex flex-wrap gap-2">
                      {p.preview.map((id) => {
                        const m = clubMembers.find((x) => x.id === id);
                        if (!m) return null;
                        return (
                          <button
                            key={id}
                            onClick={() => previewAs(id, p.to)}
                            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-white/10 hover:border-white/50 bg-black/30 text-left"
                          >
                            <img src={m.avatar} alt="" className="w-6 h-6 rounded-full object-cover grayscale" />
                            <span className="text-[11px] text-slate-200 leading-tight">{m.name}<span className="block text-[9px] text-slate-500">{m.role}</span></span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {!isLiveFirebaseConfigured && (
        <p className="text-center text-xs text-slate-500 max-w-2xl mx-auto">
          Preview mode: live sign-in is not connected on this copy, so you can explore each portal as a sample roster member. Once Firebase is configured, only real REVA Microsoft accounts can sign in.
        </p>
      )}

      <MicrosoftAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </PageShell>
  );
}

// Guard for the three portals.
export function RequireRole({ allowed, title, children }) {
  const { currentUser } = useAuth();
  if (currentUser && allowed(currentUser)) return children;
  return (
    <PageShell>
      <EmptyState
        title={currentUser ? `${title} is restricted` : `Sign in to open the ${title.toLowerCase()}`}
        action={<Link to="/portal" className={`${primaryButton} mt-4`}>{currentUser ? 'See your portals' : 'Sign in'}</Link>}
      >
        {currentUser
          ? `You're signed in as ${currentUser.position} (${currentUser.wing}). This area is for a different role.`
          : 'This area needs a REVA Microsoft sign-in with the right ORION role.'}
      </EmptyState>
    </PageShell>
  );
}
