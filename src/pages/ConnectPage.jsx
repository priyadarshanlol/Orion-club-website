import React, { useState } from 'react';
import { Mail, MessageCircle, MapPin, Send, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Linkedin, Instagram, Youtube } from '../components/BrandIcons';
import { useData } from '../context/DataContext';
import { OFFICIAL_CHANNELS, CAMPUS_ADDRESS } from '../lib/channels';
import { PageHeader, PageShell, inputClass, labelClass, primaryButton } from '../components/ui';

const ICONS = { linkedin: Linkedin, email: Mail, instagram: Instagram, whatsapp: MessageCircle, youtube: Youtube };
const TOPICS = ['General question', 'Recruitment', 'Event collaboration', 'Sponsorship', 'Faculty or university', 'Media and press'];

// Connect with ORION: every official channel in one place, plus a message form
// that lands in the committee inbox.
export default function ConnectPage() {
  const { submitInquiry } = useData();
  const channels = OFFICIAL_CHANNELS.filter((c) => c.url);
  const [form, setForm] = useState({ name: '', email: '', topic: TOPICS[0], message: '' });
  const [sent, setSent] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setSent(submitInquiry(form));
    setForm({ name: '', email: '', topic: TOPICS[0], message: '' });
  };

  return (
    <PageShell>
      <PageHeader eyebrow="Official channels" title="Connect with" accent="ORION">
        Follow ORION, write to us, or send a message straight to the committee.
      </PageHeader>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((c) => {
          const Icon = ICONS[c.id] || ArrowUpRight;
          return (
            <a
              key={c.id}
              href={c.url}
              target={c.url.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="glass-card rounded-3xl p-6 flex flex-col gap-4 group hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <div className="flex items-center justify-between">
                <span className="w-11 h-11 rounded-2xl border border-white/20 grid place-items-center text-white group-hover:bg-white group-hover:text-slate-950 transition-colors">
                  <Icon className="w-5 h-5" />
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{c.label}</div>
                <div className="font-display font-semibold text-white mt-1 break-all">{c.handle}</div>
                <p className="text-xs text-slate-400 mt-1.5">{c.note}</p>
              </div>
            </a>
          );
        })}
        <div className="glass-card rounded-3xl p-6 flex flex-col gap-4">
          <span className="w-11 h-11 rounded-2xl border border-white/20 grid place-items-center text-white"><MapPin className="w-5 h-5" /></span>
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Campus</div>
            <p className="text-sm text-slate-200 mt-1 leading-relaxed">{CAMPUS_ADDRESS}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-6 sm:p-10 grid lg:grid-cols-[1fr_1.4fr] gap-8 [&>*]:min-w-0">
        <div className="space-y-3">
          <h2 className="font-display font-bold text-white text-2xl">Send the committee a message</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Messages go straight to the ORION committee inbox. We reply by email.
          </p>
        </div>
        {sent ? (
          <div className="rounded-2xl border border-white/15 bg-black/30 p-6 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold"><CheckCircle2 className="w-5 h-5" /> Message sent</div>
            <p className="text-sm text-slate-400">Thanks, {sent.name.split(' ')[0]}. The committee will reply to {sent.email}.</p>
            <button onClick={() => setSent(null)} className="text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:underline">Send another</button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <label className="block"><span className={labelClass}>Name</span><input required value={form.name} onChange={set('name')} className={inputClass} autoComplete="name" /></label>
            <label className="block"><span className={labelClass}>Email</span><input required type="email" value={form.email} onChange={set('email')} className={inputClass} autoComplete="email" /></label>
            <label className="block sm:col-span-2"><span className={labelClass}>Topic</span>
              <select value={form.topic} onChange={set('topic')} className={inputClass}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select>
            </label>
            <label className="block sm:col-span-2"><span className={labelClass}>Message</span><textarea required rows={5} maxLength={2000} value={form.message} onChange={set('message')} className={inputClass} /></label>
            <div className="sm:col-span-2"><button className={primaryButton}><Send className="w-4 h-4" /> Send message</button></div>
          </form>
        )}
      </div>
    </PageShell>
  );
}
