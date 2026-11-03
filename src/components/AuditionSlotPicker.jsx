import React from 'react';
import { useData } from '../context/DataContext';
import { Calendar, Clock, MapPin, Users, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function AuditionSlotPicker({ selectedSlotId, onSelectSlot }) {
  const { auditionSlots } = useData();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Select Audition Slot <span className="text-amber-400">*</span>
        </label>
        <span className="text-[11px] text-cyan-400 font-medium flex items-center gap-1">
          <Users className="w-3 h-3" /> Live Real-Time Capacity Tracking
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {auditionSlots.map((slot) => {
          const isFull = slot.bookedCount >= slot.maxCapacity;
          const isSelected = selectedSlotId === slot.id;
          const seatsLeft = Math.max(0, slot.maxCapacity - slot.bookedCount);

          return (
            <div
              key={slot.id}
              onClick={() => {
                if (!isFull) {
                  onSelectSlot(slot.id);
                }
              }}
              className={`p-4 rounded-xl border transition-all relative cursor-pointer ${
                isFull
                  ? 'bg-slate-950/60 border-slate-800 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'bg-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 text-amber-400">
                  <CheckCircle2 className="w-5 h-5 fill-amber-400 text-slate-950" />
                </div>
              )}

              {/* Full Badge */}
              {isFull && (
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-bold bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-500/40">
                  <ShieldAlert className="w-3 h-3" /> FULL
                </div>
              )}

              <div className="text-sm font-bold text-slate-100 font-display mb-1">
                {slot.slotName}
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 mt-2">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{slot.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{slot.timeWindow}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{slot.venue}</span>
                </div>
              </div>

              {/* Seats Left Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Availability:</span>
                <span className={`font-bold ${seatsLeft === 0 ? 'text-rose-400' : seatsLeft <= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {isFull ? '0 Seats Left' : `${seatsLeft} / ${slot.maxCapacity} Seats Available`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
