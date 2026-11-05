import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Clock, Flag, Star, Trophy, LayoutDashboard, UserRound, ListOrdered, Plus, X, CalendarCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { isMemberUser } from '../lib/roles';
import Leaderboard, { rankMembers } from '../components/Leaderboard';
import UserProfileModal from '../components/UserProfileModal';
import { PageShell, Tabs, StatTile, Pill, FlagDots, inputClass, labelClass, primaryButton, ghostButton } from '../components/ui';
import { RequireRole } from './PortalPage';

function Overview({ me, rank, total }) {
  const { events, dispatches, rsvpEvent } = useData();
  const upcoming = events.filter((e) => e.isUpcoming);
  const flagHistory = me?.flagHistory || [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatTile label="Points" value={me?.points ?? 0} sub={me ? `Score ${me.overallScore}%` : 'Not on the roster yet'} icon={Trophy} />
        <StatTile label="Club rank" value={rank ? `#${rank}` : '—'} sub={rank ? `of ${total} active members` : 'Ranked after induction'} icon={ListOrdered} />
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.22em]">Flags</span>
            <Flag className="w-4 h-4 text-slate-300" />
          </div>
          <FlagDots flags={me?.flags ?? 3} className="scale-150 origin-left my-2" />
          <div className="text-xs text-slate-500 mt-3">{me?.flags === 3 || !me ? 'Clean record' : `${me.flags} of 3 remaining`}</div>
        </div>
        <StatTile label="Stars" value={me?.stars ?? 0} sub="Star citations" icon={Star} />
        <StatTile label="Duty hours" value={me?.hoursWorked ?? 0} sub="Logged this term" icon={Clock} />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 [&>*]:min-w-0">
        <section className="glass-panel rounded-3xl p-6 space-y-4">
          <h2 className="font-display font-bold text-white flex items-center gap-2"><Award className="w-4 h-4" /> Contribution history</h2>
          {me?.timingLogs?.length ? (
            <ol className="space-y-3">
              {me.timingLogs.map((log) => (
                <li key={log.id} className="flex gap-4 border-l border-white/15 pl-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white">{log.task}</div>
                    <div className="text-[11px] text-slate-500">{log.date} · {log.category} · logged by {log.loggedBy}</div>
                  </div>
                  <div className="font-serif text-xl text-white tabular-nums">{log.hours}h</div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-slate-500">No duty logged yet. Hours appear here once your wing lead records a shift.</p>
          )}

          {flagHistory.length > 0 && (
            <div className="pt-4 border-t border-white/[0.07] space-y-2">
              <h3 className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Flag history</h3>
              {flagHistory.map((f) => (
                <div key={f.id} className="text-xs text-slate-300 flex justify-between gap-3">
                  <span>{f.reason}</span>
                  <span className="text-slate-500 whitespace-nowrap">{f.date}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="glass-panel rounded-3xl p-6 space-y-4">
          <h2 className="font-display font-bold text-white flex items-center gap-2"><CalendarCheck className="w-4 h-4" /> Upcoming club calendar</h2>
          <ul className="space-y-3">
            {upcoming.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 glass-card rounded-2xl p-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{e.title}</div>
                  <div className="text-[11px] text-slate-500 truncate">{e.date} · {e.venue}</div>
                </div>
                <button onClick={rsvpEvent} className="shrink-0 px-3 py-1.5 rounded-full border border-white/20 hover:border-white text-[10px] font-bold uppercase tracking-[0.16em] text-white">RSVP</button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-white">Club notices</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {dispatches.slice(0, 3).map((d) => (
            <article key={d.id} className="glass-card rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2"><Pill>{d.category}</Pill><span className="text-[10px] text-slate-500 tabular-nums">{d.date}</span></div>
              <h3 className="text-sm font-semibold text-white">{d.title}</h3>
              <p className="text-xs text-slate-400">{d.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Profile({ me }) {
  const { currentUser, updateUserProfile } = useAuth();
  const { showToast } = useData();
  const [bio, setBio] = useState(currentUser.bio || '');
  const [skills, setSkills] = useState(currentUser.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [github, setGithub] = useState(currentUser.github || '');
  const [linkedin, setLinkedin] = useState(currentUser.linkedin || '');
  const [photoOpen, setPhotoOpen] = useState(false);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput('');
  };

  const save = (e) => {
    e.preventDefault();
    updateUserProfile({ bio, skills, github, linkedin });
    showToast('Profile saved.', 'success');
  };

  return (
    <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6 [&>*]:min-w-0">
      <aside className="glass-panel rounded-3xl p-6 space-y-5 h-fit">
        <img src={currentUser.photoURL} alt="" className="w-24 h-24 rounded-full object-cover border border-white/20" />
        <div>
          <div className="font-display font-bold text-xl text-white">{currentUser.displayName}</div>
          <div className="text-sm text-slate-400">{currentUser.position}</div>
        </div>
        <dl className="space-y-2 text-xs">
          {[['Wing', currentUser.wing], ['SRN', me?.srn || currentUser.srn || '—'], ['Email', currentUser.email], ['Branch', me?.branch || currentUser.branch || '—'], ['Member since', me?.joinedDate || '—']].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-white/[0.05] pb-2"><dt className="text-slate-500 uppercase tracking-[0.16em] text-[10px]">{k}</dt><dd className="text-slate-200 text-right truncate">{v}</dd></div>
          ))}
        </dl>
        <p className="text-[11px] text-slate-500">Wing, position and rank are managed by the core committee and Discipline Wing.</p>
        <button onClick={() => setPhotoOpen(true)} className={`${ghostButton} w-full`}>Edit photo &amp; details</button>
      </aside>

      <form onSubmit={save} className="glass-panel rounded-3xl p-6 space-y-5">
        <h2 className="font-display font-bold text-white">Your member profile</h2>
        <div>
          <label htmlFor="profile-bio" className={labelClass}>Bio</label>
          <textarea id="profile-bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className={inputClass} placeholder="What you build, perform or organise at ORION" />
        </div>
        <div>
          <label htmlFor="profile-skill" className={labelClass}>Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full border border-white/20 text-xs text-slate-200">
                {s}
                <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} className="p-0.5 rounded-full hover:bg-white/10" aria-label={`Remove ${s}`}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input id="profile-skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} className={inputClass} placeholder="e.g. Stage lighting, React, Videography" />
            <button type="button" onClick={addSkill} className="px-4 rounded-xl border border-white/20 hover:border-white text-white" aria-label="Add skill"><Plus className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-github" className={labelClass}>GitHub or portfolio</label>
            <input id="profile-github" value={github} onChange={(e) => setGithub(e.target.value)} className={inputClass} placeholder="https://github.com/..." />
          </div>
          <div>
            <label htmlFor="profile-linkedin" className={labelClass}>LinkedIn</label>
            <input id="profile-linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={inputClass} placeholder="https://linkedin.com/in/..." />
          </div>
        </div>
        <button type="submit" className={primaryButton}>Save profile</button>
      </form>
      <UserProfileModal isOpen={photoOpen} onClose={() => setPhotoOpen(false)} />
    </div>
  );
}

function Dashboard() {
  const { currentUser } = useAuth();
  const { clubMembers } = useData();
  const [tab, setTab] = useState('overview');

  const me = clubMembers.find((m) => m.email?.toLowerCase() === currentUser.email?.toLowerCase());
  const ranked = rankMembers(clubMembers);
  const rank = me ? ranked.findIndex((m) => m.id === me.id) + 1 : 0;

  return (
    <PageShell className="space-y-10">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <img src={currentUser.photoURL} alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-white/20" />
            {rank > 0 && <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-white text-slate-950 text-[10px] font-bold tabular-nums">#{rank}</span>}
          </div>
          <div>
            <div className="font-mono text-[11px] text-slate-500">{me?.srn || currentUser.srn || 'REVA'} · {currentUser.wing}</div>
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              Welcome back, <span className="heading-accent">{currentUser.displayName.split(' ')[0]}</span>
            </h1>
            <div className="text-sm text-slate-400">{currentUser.position}</div>
          </div>
        </div>
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'profile', label: 'Profile', icon: UserRound },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          ]}
        />
      </header>

      {!me && (
        <div className="glass-card rounded-2xl p-4 text-sm text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>You're signed in, but not on the ORION roster yet. Your stats appear once a director adds you after recruitment.</span>
          <Link to="/recruitment" className="text-[11px] font-bold uppercase tracking-[0.18em] text-white underline underline-offset-4 whitespace-nowrap">Recruitment portal</Link>
        </div>
      )}

      {tab === 'overview' && <Overview me={me} rank={rank} total={ranked.length} />}
      {tab === 'profile' && <Profile me={me} />}
      {tab === 'leaderboard' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-white">Merit leaderboard</h2>
            <p className="text-sm text-slate-400">Ranked by points from duty hours, star citations and event work. Members with no flags left are not ranked.</p>
          </div>
          <Leaderboard members={clubMembers} highlightEmail={currentUser.email} />
        </div>
      )}
    </PageShell>
  );
}

export default function MemberDashboard() {
  return (
    <RequireRole allowed={isMemberUser} title="Member dashboard">
      <Dashboard />
    </RequireRole>
  );
}
