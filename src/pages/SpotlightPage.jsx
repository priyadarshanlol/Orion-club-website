import React, { useState } from 'react';
import { ExternalLink, Trophy } from 'lucide-react';
import { useData } from '../context/DataContext';
import { PageHeader, PageShell, Tabs, Pill, EmptyState } from '../components/ui';

const WING_FILTERS = ['All', 'Discipline Wing', 'Internal & External Wing', 'Cultural Wing', 'Technical Wing', 'Media & Marketing Wing'];

// Member Spotlight: achievements published by the committee, each linked to the
// social media post that announced it. Nothing is shown until the committee adds it.
export default function SpotlightPage() {
  const { spotlights } = useData();
  const [wing, setWing] = useState('All');
  const shown = spotlights.filter((s) => wing === 'All' || s.wing === wing);

  return (
    <PageShell>
      <PageHeader eyebrow="Earned, not favoured" title="Member" accent="Spotlight">
        What ORION members have achieved, with a link to the post that celebrated it.
      </PageHeader>

      {spotlights.length > 0 && (
        <div className="flex justify-center overflow-x-auto">
          <Tabs size="sm" value={wing} onChange={setWing} tabs={WING_FILTERS.map((w) => ({ id: w, label: w === 'All' ? 'All wings' : w.replace(' Wing', '') }))} />
        </div>
      )}

      {shown.length === 0 ? (
        <EmptyState title={spotlights.length === 0 ? 'The first spotlights are on their way' : 'No spotlights for this wing yet'}>
          The committee publishes member achievements here as they happen.
        </EmptyState>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {shown.map((s) => (
            <article key={s.id} className="glass-card rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <span className="w-10 h-10 rounded-2xl border border-white/20 grid place-items-center text-white"><Trophy className="w-4 h-4" /></span>
                <span className="text-[11px] text-slate-500 tabular-nums">{s.date}</span>
              </div>
              <div className="space-y-1">
                <div className="font-display font-bold text-white text-lg leading-snug">{s.title}</div>
                <div className="text-sm text-slate-300">{s.memberName}</div>
                {s.wing && <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{s.wing}</div>}
              </div>
              {s.detail && <p className="text-sm text-slate-400 leading-relaxed">{s.detail}</p>}
              {s.postUrl && (
                <a href={s.postUrl} target="_blank" rel="noreferrer" className="mt-auto inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:underline underline-offset-4">
                  View the {s.platform} post <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {!s.postUrl && <Pill className="mt-auto self-start">No post linked</Pill>}
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
