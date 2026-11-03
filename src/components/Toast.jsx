import React from 'react';
import { useData } from '../context/DataContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast() {
  const { toast } = useData();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-md w-full px-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-xl border ${
            isSuccess
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
              : isError
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-100'
              : 'bg-slate-900/90 border-cyan-500/40 text-cyan-100'
          }`}
        >
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}
          
          <div className="flex-1 text-sm font-medium leading-relaxed">
            {toast.message}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
