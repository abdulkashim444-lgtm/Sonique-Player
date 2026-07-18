/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Sparkles, Moon, Sun, ToggleLeft, ToggleRight, Info, Zap, Trash2, HeartHandshake } from 'lucide-react';
import { AppSettings, AppTheme, AnimationSpeed } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClearCache: () => void;
  activeThemeColor: string;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  setSettings,
  onClearCache,
  activeThemeColor
}: SettingsPanelProps) {
  if (!isOpen) return null;

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div 
      id="settings-dialog-overlay"
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans"
      onClick={onClose}
    >
      <div 
        className="glass-panel border-slate-800/80 max-w-lg w-full rounded-3xl p-6 shadow-2xl relative animate-float-short"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800/60 pb-4 mb-5">
          <h3 className="text-base font-extrabold text-white tracking-wider uppercase flex items-center gap-2">
            ⚙️ Sonique Audio Settings
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          
          {/* Section 1: Themes */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              Visual Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['dark', 'light', 'dynamic'] as AppTheme[]).map(t => (
                <button
                  key={t}
                  onClick={() => updateSetting('theme', t)}
                  className={`py-3 px-4 rounded-2xl border text-sm font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    settings.theme === t 
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 font-bold' 
                      : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 'dark' && <Moon size={16} />}
                  {t === 'light' && <Sun size={16} />}
                  {t === 'dynamic' && <Sparkles size={16} />}
                  <span className="capitalize">{t}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
              *<b>Dynamic Theme</b> uses our algorithmic backdrop coloring, extracting primary and secondary colors directly from current Album Art.
            </p>
          </div>

          {/* Section 2: Animations */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              App Animation Speed
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['slow', 'normal', 'fast'] as AnimationSpeed[]).map(speed => (
                <button
                  key={speed}
                  onClick={() => updateSetting('animationSpeed', speed)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                    settings.animationSpeed === speed 
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                      : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Default Volume */}
          <div className="space-y-2 bg-slate-950/30 p-4 rounded-2xl border border-slate-900/50">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span className="font-sans">Default Boot Volume</span>
              <span className="text-indigo-400 font-mono">{Math.round(settings.defaultVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.defaultVolume}
              onChange={(e) => updateSetting('defaultVolume', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Section 4: Toggle Toggles */}
          <div className="space-y-3">
            {/* Custom Cursor */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/30 border border-slate-900/50">
              <div>
                <div className="text-xs font-bold text-slate-200 font-sans">Premium Custom Cursor</div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">Smooth trailing neon cursor ring</div>
              </div>
              <button
                onClick={() => updateSetting('customCursorEnabled', !settings.customCursorEnabled)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {settings.customCursorEnabled ? (
                  <ToggleRight size={28} className="text-indigo-400" />
                ) : (
                  <ToggleLeft size={28} className="text-slate-600" />
                )}
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/30 border border-slate-900/50">
              <div>
                <div className="text-xs font-bold text-slate-200 font-sans">Toast Status Popups</div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">Shows tracks, volume, and favorites states</div>
              </div>
              <button
                onClick={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {settings.notificationsEnabled ? (
                  <ToggleRight size={28} className="text-indigo-400" />
                ) : (
                  <ToggleLeft size={28} className="text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {/* Section 5: Cache Clean & Reset */}
          <div className="pt-4 border-t border-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
              <Info size={12} className="text-indigo-500" />
              <span>Data persists locally in LocalStorage.</span>
            </div>
            <button
              onClick={onClearCache}
              className="text-xs font-bold font-sans text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 size={12} /> Clear Cache / Reset Player
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
