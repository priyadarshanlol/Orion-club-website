import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { Tabs } from './ui';

const CATEGORY_BY_WING = { cultural: 'Cultural', technical: 'Tech', media: 'Media', discipline: 'Events', 'internal-external': 'Events' };
export const GALLERY_FILTERS = ['All', 'Events', 'Cultural', 'Tech', 'Media', 'Awards'];

// Flattens finished events' media into gallery items.
export function galleryItemsFrom(events) {
  return events
    .filter((e) => e.media && (e.media.images?.length || e.media.videos?.length))
    .flatMap((e) => {
      const category = /award/i.test(e.title) ? 'Awards' : CATEGORY_BY_WING[e.wingId] || 'Events';
      const base = { eventId: e.id, eventTitle: e.title, date: e.date, category, description: e.description };
      return [
        ...(e.media.images || []).map((src, i) => ({ ...base, id: `${e.id}-img-${i}`, type: 'image', src })),
        ...(e.media.videos || []).map((src, i) => ({ ...base, id: `${e.id}-vid-${i}`, type: 'video', src, poster: e.bannerUrl })),
      ];
    });
}

export default function Gallery({ events, limit }) {
  const [filter, setFilter] = useState('All');
  const [openIndex, setOpenIndex] = useState(null);

  const all = useMemo(() => galleryItemsFrom(events), [events]);
  const filtered = filter === 'All' ? all : all.filter((i) => i.category === filter);
  const shown = limit ? filtered.slice(0, limit) : filtered;
  const current = openIndex !== null ? shown[openIndex] : null;
  const move = (d) => setOpenIndex((i) => (i + d + shown.length) % shown.length);

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <Tabs size="sm" tabs={GALLERY_FILTERS} value={filter} onChange={(f) => { setFilter(f); setOpenIndex(null); }} />
      </div>

      {shown.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-10">No media in this category yet. The Media wing adds photos after each event.</p>
      ) : (
        <div className="columns-2 md:columns-3 gap-3 sm:gap-4 [&>*]:mb-3 sm:[&>*]:mb-4">
          {shown.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setOpenIndex(i)}
              className="group relative block w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-left break-inside-avoid focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <img
                src={item.type === 'video' ? item.poster : item.src}
                alt={item.eventTitle}
                loading="lazy"
                className={`w-full object-cover grayscale-[35%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700 ${i % 3 === 1 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}
              />
              {item.type === 'video' && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="w-12 h-12 rounded-full bg-white/90 grid place-items-center">
                    <Play className="w-5 h-5 text-slate-950 fill-slate-950 ml-0.5" />
                  </span>
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <span className="block text-[9px] tracking-[0.25em] uppercase text-slate-400">{item.category} · {item.date}</span>
                <span className="block text-xs sm:text-sm font-semibold text-white leading-snug">{item.eventTitle}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label={current.eventTitle}
          >
            <button className="absolute top-4 right-4 p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10" aria-label="Close">
              <X className="w-6 h-6" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); move(-1); }} className="absolute left-2 sm:left-6 p-3 rounded-full text-slate-300 hover:text-white hover:bg-white/10" aria-label="Previous">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); move(1); }} className="absolute right-2 sm:right-6 p-3 rounded-full text-slate-300 hover:text-white hover:bg-white/10" aria-label="Next">
              <ChevronRight className="w-6 h-6" />
            </button>
            <figure className="max-w-5xl w-full space-y-3" onClick={(e) => e.stopPropagation()}>
              {current.type === 'video' ? (
                <video src={current.src} poster={current.poster} controls autoPlay className="w-full max-h-[75vh] rounded-2xl bg-black" />
              ) : (
                <img src={current.src} alt={current.eventTitle} className="w-full max-h-[75vh] object-contain rounded-2xl" />
              )}
              <figcaption className="text-center space-y-1">
                <div className="text-[10px] tracking-[0.3em] uppercase text-slate-500">{current.category} · {current.date}</div>
                <div className="font-display font-bold text-white">{current.eventTitle}</div>
                <p className="text-xs text-slate-400 max-w-2xl mx-auto">{current.description}</p>
              </figcaption>
            </figure>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
