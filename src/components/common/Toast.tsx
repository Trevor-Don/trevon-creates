import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl border shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 transition-all animate-fade-in ${
            toast.type === 'success'
              ? 'bg-[#080B09]/95 border-[#00FF00]/50 text-white shadow-[0_0_25px_rgba(0,255,0,0.15)] ring-1 ring-[#00FF00]/20'
              : toast.type === 'error'
              ? 'bg-[#120808]/95 border-red-500/50 text-white shadow-[0_0_25px_rgba(239,68,68,0.2)] ring-1 ring-red-500/30'
              : 'bg-[#080B09]/95 border-blue-500/50 text-white shadow-[0_0_25px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20'
          }`}
        >
          <div className="flex items-start gap-3">
            {toast.type === 'success' && (
              <div className="w-6 h-6 rounded-full bg-[#00FF00]/20 border border-[#00FF00]/40 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-[#00FF00]" />
              </div>
            )}
            {toast.type === 'error' && (
              <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
            )}
            {toast.type === 'info' && (
              <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-blue-400" />
              </div>
            )}
            <div className="space-y-0.5">
              <div className="font-heading font-bold text-xs tracking-tight text-white">
                {toast.title}
              </div>
              {toast.message && (
                <div className="font-sans text-[11px] text-neutral-300 leading-relaxed">
                  {toast.message}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors shrink-0"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
