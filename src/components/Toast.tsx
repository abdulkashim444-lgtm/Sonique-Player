/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div 
      id="app-toast-container"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => {
        return (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        );
      })}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void; key?: any }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000); // dismiss after 4 seconds
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    info: <Info size={16} className="text-blue-400" />,
    success: <CheckCircle size={16} className="text-emerald-400" />,
    warning: <AlertTriangle size={16} className="text-amber-400" />,
    error: <XCircle size={16} className="text-rose-400" />,
  };

  const bgStyles = {
    info: 'bg-slate-900/95 border-blue-500/30 text-blue-100',
    success: 'bg-slate-900/95 border-emerald-500/30 text-emerald-100',
    warning: 'bg-slate-900/95 border-amber-500/30 text-amber-100',
    error: 'bg-slate-900/95 border-rose-500/30 text-rose-100',
  };

  return (
    <div
      className={`p-3.5 rounded-2xl border flex items-center gap-3 shadow-xl backdrop-blur-xl animate-bounce-short pointer-events-auto transition-all hover:scale-101 ${
        bgStyles[toast.type]
      }`}
      style={{ animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div>{icons[toast.type]}</div>
      <p className="text-xs font-bold font-sans flex-1 leading-relaxed">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <X size={12} />
      </button>
    </div>
  );
}
