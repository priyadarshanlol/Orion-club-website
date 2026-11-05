import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Smartphone, Copy, MessageCircle, Send } from 'lucide-react';
import { useData } from '../context/DataContext';
import { inputClass, labelClass, primaryButton, ghostButton } from './ui';
import {
  HACKATHON_ID, SCHOOLS, SEMESTERS, DOMAINS, DOMAIN_NOTE, UPI, PAYMENT_INSTRUCTIONS, WHATSAPP_GROUP, UTR_RE, personError,
} from '../lib/hackathonForm';

/*
 * Aarambh 2026 registration, one section at a time, in the same order as the
 * club's Google Form: team lead → member 2 → member 3 (3-member teams only)
 * → domains → payment → review. "Next" only opens when the current section is
 * complete. The draft is kept in this browser so switching to a UPI app to pay
 * does not lose what was typed.
 */

const DRAFT_KEY = 'orion_aarambh_draft';
const blankPerson = () => ({ name: '', email: '', phone: '', srn: '', school: '', schoolOther: '', sem: '', branch: '' });
const blankForm = () => ({
  teamName: '',
  teamSize: '',
  lead: blankPerson(),
  members: [blankPerson(), blankPerson()],
  domain1: '',
  domain2: '',
  payment: { utr: '', paidBy: '' },
});

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? { ...blankForm(), ...JSON.parse(raw) } : blankForm();
  } catch {
    return blankForm();
  }
};

const schoolOf = (p) => (p.school === 'Other' ? p.schoolOther.trim() : p.school);
const cleanPerson = (p) => ({ name: p.name.trim(), email: p.email.trim().toLowerCase(), phone: p.phone.trim(), srn: p.srn.trim().toUpperCase(), school: schoolOf(p), sem: p.sem, branch: p.branch.trim() });

function Radio({ name, value, checked, onChange, children }) {
  return (
    <label className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 cursor-pointer text-sm transition-colors ${checked ? 'border-white/60 bg-white/[0.08] text-white' : 'border-white/10 text-slate-300 hover:border-white/30'}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="accent-white" />
      <span>{children}</span>
    </label>
  );
}

function PersonFields({ who, person, onChange, idPrefix }) {
  const set = (k) => (e) => onChange({ ...person, [k]: e.target.value });
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block"><span className={labelClass}>{who} Name *</span><input value={person.name} onChange={set('name')} className={inputClass} autoComplete={idPrefix === 'lead' ? 'name' : 'off'} /></label>
        <label className="block"><span className={labelClass}>{who} Email Address *</span><input type="email" value={person.email} onChange={set('email')} className={inputClass} autoComplete={idPrefix === 'lead' ? 'email' : 'off'} /></label>
        <label className="block"><span className={labelClass}>{who} Contact Number *</span><input type="tel" inputMode="tel" value={person.phone} onChange={set('phone')} className={inputClass} autoComplete={idPrefix === 'lead' ? 'tel' : 'off'} /></label>
        <label className="block"><span className={labelClass}>{who} SRN *</span><input value={person.srn} onChange={set('srn')} className={inputClass} /></label>
      </div>
      <fieldset>
        <legend className={labelClass}>{who} School *</legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[...SCHOOLS, 'Other'].map((s) => (
            <Radio key={s} name={`${idPrefix}-school`} value={s} checked={person.school === s} onChange={set('school')}>{s}</Radio>
          ))}
        </div>
        {person.school === 'Other' && (
          <input value={person.schoolOther} onChange={set('schoolOther')} placeholder="Your school" className={`${inputClass} mt-2`} />
        )}
      </fieldset>
      <div className="grid sm:grid-cols-2 gap-4">
        <fieldset>
          <legend className={labelClass}>{who} Semester *</legend>
          <div className="grid grid-cols-4 gap-2">
            {SEMESTERS.map((s) => <Radio key={s} name={`${idPrefix}-sem`} value={s} checked={person.sem === s} onChange={set('sem')}>{s}</Radio>)}
          </div>
        </fieldset>
        <label className="block"><span className={labelClass}>{who} Branch *</span><input value={person.branch} onChange={set('branch')} className={inputClass} /></label>
      </div>
    </div>
  );
}

const personCheck = (p, label) => (p.school === 'Other' && !p.schoolOther.trim() ? `${label}: type your school name.` : '') || personError(cleanPerson(p), label);

export default function AarambhForm({ fee, onRegistered }) {
  const { registerForEvent } = useData();
  const [form, setForm] = useState(loadDraft);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { /* storage unavailable */ }
  }, [form]);

  const steps = useMemo(() => {
    const list = [{ id: 'lead', title: 'Team & team lead' }, { id: 'member2', title: '2nd team member' }];
    if (form.teamSize === '3') list.push({ id: 'member3', title: '3rd team member' });
    list.push({ id: 'domains', title: 'Hackathon domains' }, { id: 'payment', title: 'Registration fee payment' }, { id: 'review', title: 'Review & submit' });
    return list;
  }, [form.teamSize]);
  const current = steps[Math.min(step, steps.length - 1)];

  const check = (id) => {
    if (id === 'lead') {
      if (!form.teamName.trim()) return 'Enter your team name.';
      return personCheck(form.lead, 'Team lead') || (form.teamSize ? '' : 'Choose your team size.');
    }
    if (id === 'member2') return personCheck(form.members[0], '2nd team member');
    if (id === 'member3') return personCheck(form.members[1], '3rd team member');
    if (id === 'domains') {
      if (!form.domain1) return 'Choose your 1st preference.';
      if (!form.domain2) return 'Choose your 2nd preference.';
      if (form.domain1 === form.domain2) return 'Your 2nd preference must be a different domain.';
      return '';
    }
    if (id === 'payment') {
      if (!UTR_RE.test(form.payment.utr.replace(/\s/g, ''))) return 'Enter the UTR / UPI transaction ID from your payment app.';
      if (!form.payment.paidBy.trim()) return 'Enter the name of the person who made the payment.';
      return '';
    }
    return '';
  };

  const go = (dir) => {
    setError('');
    if (dir > 0) {
      const msg = check(current.id);
      if (msg) { setError(msg); return; }
    }
    setStep((s) => Math.max(0, Math.min(steps.length - 1, s + dir)));
    document.getElementById('aarambh-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submit = async () => {
    for (const s of steps) {
      const msg = check(s.id);
      if (msg) { setError(msg); setStep(steps.indexOf(s)); return; }
    }
    setBusy(true);
    setError('');
    const lead = cleanPerson(form.lead);
    const size = Number(form.teamSize);
    try {
      const res = await registerForEvent(HACKATHON_ID, {
        ...lead,
        teamName: form.teamName.trim(),
        teamSize: size,
        lead,
        members: form.members.slice(0, size - 1).map(cleanPerson),
        domain1: form.domain1,
        domain2: form.domain2,
        payment: { utr: form.payment.utr.replace(/\s/g, '').toUpperCase(), paidBy: form.payment.paidBy.trim() },
      });
      if (!res.ok && res.reason !== 'already') { setError(res.message || 'Registration could not be completed. Please try again.'); return; }
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      onRegistered(res.registration, res.reason === 'already');
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const setLead = (lead) => setForm((f) => ({ ...f, lead }));
  const setMember = (i) => (m) => setForm((f) => ({ ...f, members: f.members.map((x, j) => (j === i ? m : x)) }));
  const setPay = (k) => (e) => setForm((f) => ({ ...f, payment: { ...f.payment, [k]: e.target.value } }));
  const isLast = current.id === 'review';

  return (
    <div id="aarambh-form" className="space-y-6 scroll-mt-28">
      {/* progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-400">
          <span>Step {step + 1} of {steps.length}</span>
          <span className="text-white">{current.title}</span>
        </div>
        <div className="flex gap-1.5" aria-hidden="true">
          {steps.map((s, i) => <span key={s.id} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-white' : 'bg-white/15'}`} />)}
        </div>
      </div>

      {current.id === 'lead' && (
        <div className="space-y-5">
          <label className="block"><span className={labelClass}>Team Name *</span><input value={form.teamName} maxLength={60} onChange={(e) => setForm((f) => ({ ...f, teamName: e.target.value }))} className={inputClass} /></label>
          <PersonFields who="Team Lead" person={form.lead} onChange={setLead} idPrefix="lead" />
          <fieldset>
            <legend className={labelClass}>Team Size *</legend>
            <div className="grid grid-cols-2 gap-2 max-w-sm">
              {[['2', '2 Members'], ['3', '3 Members']].map(([v, l]) => (
                <Radio key={v} name="team-size" value={v} checked={form.teamSize === v} onChange={(e) => setForm((f) => ({ ...f, teamSize: e.target.value }))}>{l}</Radio>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {current.id === 'member2' && <PersonFields who="2nd Team Member" person={form.members[0]} onChange={setMember(0)} idPrefix="m2" />}

      {current.id === 'member3' && <PersonFields who="3rd Team Member" person={form.members[1]} onChange={setMember(1)} idPrefix="m3" />}

      {current.id === 'domains' && (
        <div className="space-y-6">
          {[['domain1', '1st Preference'], ['domain2', '2nd Preference']].map(([k, label]) => (
            <fieldset key={k}>
              <legend className={labelClass}>{label} *</legend>
              <div className="grid sm:grid-cols-2 gap-2">
                {DOMAINS.map((d) => (
                  <Radio key={d} name={k} value={d} checked={form[k] === d} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}>{d}</Radio>
                ))}
              </div>
            </fieldset>
          ))}
          <p className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-400 leading-relaxed"><span className="text-white font-semibold">Note: </span>{DOMAIN_NOTE}</p>
        </div>
      )}

      {current.id === 'payment' && (
        <div className="space-y-5">
          <p className="text-sm text-slate-300">Pay the registration fee of <span className="text-white font-semibold">₹{fee}</span> per team, then enter the payment details below.</p>
          <div className="grid sm:grid-cols-[auto_1fr] gap-5 items-center">
            <div className="bg-white rounded-2xl p-3 w-52 mx-auto">
              <img src={UPI.qr} alt={`UPI QR code to pay ${UPI.name}`} className="w-full" />
            </div>
            <div className="space-y-3 text-center sm:text-left">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Pay to</div>
                <div className="font-display font-semibold text-white">{UPI.name}</div>
              </div>
              <button
                type="button"
                onClick={() => { navigator.clipboard?.writeText(UPI.id).then(() => setCopied(true)).catch(() => {}); }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 font-mono text-sm text-slate-200 hover:border-white/40"
              >
                {UPI.id} {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <div><a href={UPI.link} className={`${ghostButton} !py-2 sm:hidden`}><Smartphone className="w-4 h-4" /> Open UPI app</a></div>
              <p className="text-xs text-slate-500">Scan with any UPI app (PhonePe, Google Pay, Paytm) and pay exactly ₹{fee}.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block"><span className={labelClass}>UTR Number *</span><input value={form.payment.utr} onChange={setPay('utr')} className={`${inputClass} font-mono`} placeholder="12-digit UPI transaction ID" /></label>
            <label className="block"><span className={labelClass}>Payment Made By (Person Name) *</span><input value={form.payment.paidBy} onChange={setPay('paidBy')} className={inputClass} /></label>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2 text-xs text-slate-400 leading-relaxed">
            <div className="text-white font-semibold uppercase tracking-[0.15em] text-[11px]">Payment instructions</div>
            {PAYMENT_INSTRUCTIONS.map((t) => <p key={t}>{t}</p>)}
          </div>
        </div>
      )}

      {current.id === 'review' && (
        <div className="space-y-4 text-sm">
          <ReviewBlock title="Team" rows={[['Team name', form.teamName], ['Team size', `${form.teamSize} members`]]} />
          {[form.lead, ...form.members.slice(0, Number(form.teamSize) - 1)].map((p, i) => (
            <ReviewBlock key={i} title={i === 0 ? 'Team lead' : `Team member ${i + 1}`} rows={[['Name', p.name], ['Email', p.email], ['Contact', p.phone], ['SRN', p.srn.toUpperCase()], ['School', schoolOf(p)], ['Semester', p.sem], ['Branch', p.branch]]} />
          ))}
          <ReviewBlock title="Domains" rows={[['1st preference', form.domain1], ['2nd preference', form.domain2]]} />
          <ReviewBlock title="Payment" rows={[['Amount', `₹${fee}`], ['UTR number', form.payment.utr.replace(/\s/g, '').toUpperCase()], ['Paid by', form.payment.paidBy]]} />
          <p className="text-xs text-slate-500">Check everything above. You can go back to fix any section before submitting.</p>
        </div>
      )}

      {error && <p className="text-sm text-amber-200" role="alert">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => go(-1)} className={`${ghostButton} !py-2.5`}><ArrowLeft className="w-4 h-4" /> Back</button>
        ) : <span />}
        {isLast ? (
          <button type="button" onClick={submit} disabled={busy} className={primaryButton}><Send className="w-4 h-4" /> {busy ? 'Submitting…' : 'Submit registration'}</button>
        ) : (
          <button type="button" onClick={() => go(1)} className={primaryButton}>Next <ArrowRight className="w-4 h-4" /></button>
        )}
      </div>
    </div>
  );
}

function ReviewBlock({ title, rows }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">{title}</div>
      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 min-w-0"><dt className="text-slate-500 shrink-0">{k}</dt><dd className="text-slate-200 truncate text-right">{v}</dd></div>
        ))}
      </dl>
    </div>
  );
}

export function WhatsAppJoin() {
  if (!WHATSAPP_GROUP.url) return null;
  return (
    <a href={WHATSAPP_GROUP.url} target="_blank" rel="noreferrer" className={`${ghostButton} w-full`}>
      <MessageCircle className="w-4 h-4" /> Join WhatsApp group: {WHATSAPP_GROUP.label}
    </a>
  );
}
