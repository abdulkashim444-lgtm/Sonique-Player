/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Play, SkipForward, SkipBack, Volume2, VolumeX, Shuffle, Repeat, Heart, FileText } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause', icon: <Play size={14} /> },
    { key: '← (Left)', desc: 'Previous Song', icon: <SkipBack size={14} /> },
    { key: '→ (Right)', desc: 'Next Song', icon: <SkipForward size={14} /> },
    { key: '↑ (Up)', desc: 'Volume Up (+5%)', icon: <Volume2 size={14} /> },
    { key: '↓ (Down)', desc: 'Volume Down (-5%)', icon: <Volume2 size={14} /> },
    { key: 'M', desc: 'Mute / Unmute', icon: <VolumeX size={14} /> },
    { key: 'S', desc: 'Toggle Shuffle', icon: <Shuffle size={14} /> },
    { key: 'R', desc: 'Toggle Repeat Mode', icon: <Repeat size={14} /> },
    { key: 'F', desc: 'Toggle Favorite / Liked', icon: <Heart size={14} /> },
    { key: 'L', desc: 'Toggle Lyrics View', icon: <FileText size={14} /> },
  ];

  return (
    <div 
      id="shortcuts-dialog-overlay"
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans"
      onClick={onClose}
    >
      <div 
        className="glass-panel border-slate-800/80 max-w-md w-full rounded-3xl p-6 shadow-2xl relative animate-float-short"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800/60 pb-4 mb-4">
          <h3 className="text-base font-extrabold text-white tracking-wider uppercase flex items-center gap-2">
            ⌨️ Keyboard Shortcuts
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-3">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-900/50">
              <div className="flex items-center gap-2.5">
                <span className="text-slate-500">{sc.icon}</span>
                <span className="text-xs font-semibold text-slate-300">{sc.desc}</span>
              </div>
              <kbd className="px-2.5 py-1 text-xs font-bold font-mono bg-slate-950 border border-slate-800 text-indigo-400 rounded-lg shadow-inner min-w-[50px] text-center">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-slate-500 italic">
          Try clicking these keys anytime during playback for quick interactive changes!
        </div>
      </div>
    </div>
  );
}
