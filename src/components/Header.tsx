/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, Sun, Moon, Sparkles, Mic, MicOff, Fullscreen, Keyboard, 
  Tv, Volume2, ShieldAlert, MonitorPlay, Zap
} from 'lucide-react';
import { AppTheme, AppSettings } from '../types';

interface HeaderProps {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  onVoiceCommand: (command: string) => void;
  activeThemeColor: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onTogglePictureInPicture: () => void;
  toastNotification: (msg: string, type: 'info' | 'success') => void;
}

export default function Header({
  theme,
  setTheme,
  onOpenSettings,
  onOpenShortcuts,
  onVoiceCommand,
  activeThemeColor,
  isFullscreen,
  onToggleFullscreen,
  onTogglePictureInPicture,
  toastNotification
}: HeaderProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize Web Speech API for Local Voice Control
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        toastNotification('Voice control listening...', 'info');
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript.toLowerCase();
        console.log('Voice Command Received:', text);
        onVoiceCommand(text);
        setIsListening(false);
      };

      rec.onerror = (err: any) => {
        console.error('Speech Recognition Error:', err);
        setIsListening(false);
        toastNotification('Voice control timed out or failed.', 'info');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleVoiceListening = () => {
    if (!recognition) {
      toastNotification('Voice commands not supported in this browser.', 'info');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.warn(err);
      }
    }
  };

  return (
    <header 
      id="app-navigation-header"
      className="glass-panel rounded-3xl p-4 flex items-center justify-between border-slate-800 shadow-xl backdrop-blur-2xl z-10 font-sans"
    >
      {/* App Branding */}
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg animate-pulse"
          style={{ 
            background: `linear-gradient(135deg, #ff4e00, #ff8e00)`,
            boxShadow: `0 0 15px rgba(255, 78, 0, 0.6)`
          }}
        >
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-widest text-white font-sans neon-text-dynamic">
            SONIQUE<span className="text-orange-500 font-bold">.</span>
          </h1>
          <p className="text-[10px] text-orange-500/80 font-mono tracking-widest uppercase font-semibold">
            Atmospheric Synthesizer
          </p>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-2">
        {/* Fullscreen Mode */}
        <button
          onClick={onToggleFullscreen}
          className={`p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer ${isFullscreen ? 'text-indigo-400 border-indigo-500/50' : ''}`}
          title="Toggle Fullscreen"
        >
          <Fullscreen size={16} />
        </button>

        {/* Picture-in-Picture */}
        <button
          onClick={onTogglePictureInPicture}
          className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer"
          title="Picture-in-Picture Mini Player"
        >
          <Tv size={16} />
        </button>

        {/* Local Voice Recognition */}
        <button
          onClick={toggleVoiceListening}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
            isListening 
              ? 'bg-rose-500/20 border-rose-500/60 text-rose-400 animate-pulse' 
              : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
          title="Voice Control (Try 'play', 'pause', 'next', 'mute')"
        >
          {isListening ? <Mic size={16} /> : <MicOff size={16} />}
          <span className="hidden sm:inline text-xs font-semibold font-sans">Voice Control</span>
        </button>

        {/* Theme Selectors */}
        <div className="flex items-center bg-slate-950/40 border border-slate-800/80 rounded-xl p-0.5">
          <button
            onClick={() => setTheme('dark')}
            className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              theme === 'dark' ? 'bg-slate-800 text-indigo-400 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon size={14} />
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              theme === 'light' ? 'bg-slate-200 text-slate-900 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun size={14} />
          </button>
          <button
            onClick={() => setTheme('dynamic')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              theme === 'dynamic' ? 'bg-indigo-600/20 text-indigo-400 shadow border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">Dynamic</span>
          </button>
        </div>

        {/* Shortcuts */}
        <button
          onClick={onOpenShortcuts}
          className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer"
          title="Keyboard Shortcuts"
        >
          <Keyboard size={16} />
        </button>

        {/* Settings Panel Toggle */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-all cursor-pointer"
          title="Audio & Player Settings"
        >
          <Settings size={16} className="animate-hover:spin" />
        </button>
      </div>
    </header>
  );
}
