/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Song, RepeatMode, VisualizerStyle, AppSettings } from '../types';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, VolumeX,
  Sparkles, FileText, BarChart2, Star, Download, Share2, HelpCircle, ArrowUp, ArrowDown, ListCollapse, Timer, Heart
} from 'lucide-react';
import Visualizer from './Visualizer';
import LyricsPanel from './LyricsPanel';

interface MainPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  repeatMode: RepeatMode;
  onToggleRepeat: () => void;
  onToggleFavorite: (id: string) => void;
  favorites: string[];
  onRateSong: (id: string, rating: number) => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  sleepTimer: number | null;
  onSetSleepTimer: (minutes: number | null) => void;
  activeThemeColor: string;
}

export default function MainPlayer({
  currentSong,
  isPlaying,
  currentTime,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleMute,
  volume,
  isMuted,
  isShuffle,
  onToggleShuffle,
  repeatMode,
  onToggleRepeat,
  onToggleFavorite,
  favorites,
  onRateSong,
  settings,
  setSettings,
  sleepTimer,
  onSetSleepTimer,
  activeThemeColor
}: MainPlayerProps) {
  const [activeTab, setActiveTab] = useState<'visualizer' | 'lyrics' | 'equalizer'>('visualizer');
  const [isHoveredVinyl, setIsHoveredVinyl] = useState(false);
  const [customTimerVal, setCustomTimerVal] = useState('');

  if (!currentSong) {
    return (
      <div className="flex-1 glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center h-full border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-rose-950/20"></div>
        
        {/* Neon glowing sphere */}
        <div className="w-48 h-48 rounded-full bg-indigo-600/10 blur-3xl mb-8 animate-pulse"></div>

        <h3 className="text-2xl font-bold font-sans text-slate-100 relative z-10">Welcome to Sonique Player</h3>
        <p className="text-slate-400 mt-2 max-w-md font-sans text-sm relative z-10 leading-relaxed">
          Select a synthesizer track or add external audio links from the playlist. Tap on your keyboard or speak simple voice commands to control.
        </p>
        <button
          onClick={onPlayPause}
          className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-103 transition-all relative z-10 cursor-pointer"
        >
          Begin Acoustic Journey
        </button>
      </div>
    );
  }

  const isFavorite = favorites.includes(currentSong.id);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const shareSong = () => {
    if (navigator.share) {
      navigator.share({
        title: currentSong.title,
        text: `Listening to ${currentSong.title} by ${currentSong.artist} on Sonique Player!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('App link copied to clipboard!');
    }
  };

  const handleCustomTimerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const min = parseFloat(customTimerVal);
    if (!isNaN(min) && min > 0) {
      onSetSleepTimer(min);
      setCustomTimerVal('');
    }
  };

  return (
    <div 
      id="app-main-player-card"
      className="flex-1 glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6 h-full border-slate-800 shadow-2xl relative overflow-hidden text-slate-100"
    >
      {/* Background soft blur gradient tailored to current song */}
      <div 
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[160px] opacity-25 pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: activeThemeColor }}
      ></div>
      <div 
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[160px] opacity-25 pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: currentSong.secondaryColor }}
      ></div>

      {/* Top Bar Tabs */}
      <div className="flex justify-between items-center relative z-10 border-b border-slate-800/60 pb-4">
        {/* Song genre + bit info */}
        <div className="flex gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-400">
            {currentSong.genre}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-400">
            {currentSong.year}
          </span>
        </div>

        {/* Audio Content Mode Selector */}
        <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'visualizer' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 size={14} /> Visualizer
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'lyrics' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={14} /> Lyrics
          </button>
          <button
            onClick={() => setActiveTab('equalizer')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'equalizer' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} /> EQ & Sleep
          </button>
        </div>
      </div>

      {/* Core Display Area (Changes based on selected Tab) */}
      <div className="flex-1 flex flex-col justify-center min-h-0 relative z-10">
        
        {/* DISPLAY: Visualizer & Vinyl Cover */}
        {activeTab === 'visualizer' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-0">
            {/* Album artwork & Vinyl Spinner */}
            <div className="flex flex-col items-center justify-center relative">
              <div 
                className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-full shadow-2xl flex items-center justify-center animate-float"
                onMouseEnter={() => setIsHoveredVinyl(true)}
                onMouseLeave={() => setIsHoveredVinyl(false)}
              >
                {/* Glow aura */}
                <div 
                  className="absolute inset-0 rounded-full blur-2xl opacity-40 transition-all duration-1000"
                  style={{ 
                    backgroundColor: activeThemeColor,
                    boxShadow: isPlaying ? `0 0 40px ${activeThemeColor}` : 'none'
                  }}
                ></div>

                {/* Rotating Vinyl */}
                <div 
                  className={`absolute inset-0 rounded-full bg-slate-950 border-4 border-slate-800 shadow-inner flex items-center justify-center ${
                    isPlaying ? 'animate-spin-vinyl' : 'animate-spin-vinyl animate-spin-vinyl-paused'
                  }`}
                  style={{
                    backgroundImage: 'radial-gradient(circle, #000 30%, #111 60%, #000 80%, #333 90%, #000 100%)'
                  }}
                >
                  {/* Concentric grooved lines for realistic vinyl feeling */}
                  <div className="absolute inset-2 border border-slate-900/30 rounded-full"></div>
                  <div className="absolute inset-6 border border-slate-900/40 rounded-full"></div>
                  <div className="absolute inset-12 border border-slate-900/50 rounded-full"></div>
                  <div className="absolute inset-18 border border-slate-900/60 rounded-full"></div>
                  <div className="absolute inset-24 border border-slate-900/70 rounded-full"></div>

                  {/* Album Cover inside */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-slate-950 relative">
                    <img 
                      src={currentSong.coverUrl} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                    {/* Centered record adapter hole */}
                    <div className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-800"></div>
                  </div>
                </div>
              </div>

              {/* Vinyl reflection overlay */}
              <div className="w-52 sm:w-64 h-4 bg-gradient-to-t from-white/10 to-transparent blur-md rounded-full opacity-20 mt-4"></div>
            </div>

            {/* Visualizer Canvas Area */}
            <div className="flex-1 h-52 sm:h-64 rounded-2xl bg-slate-950/35 border border-slate-800/40 p-1 relative">
              <Visualizer 
                style={settings.visualizerStyle} 
                themeColor={activeThemeColor} 
                isPlaying={isPlaying} 
              />
              {/* Overlay controls for visualizer styles */}
              <div className="absolute bottom-3 right-3 flex gap-1 bg-slate-900/90 border border-slate-800 px-2 py-1 rounded-xl">
                {(['bars', 'waves', 'circular', 'pulse'] as VisualizerStyle[]).map(styleOpt => (
                  <button
                    key={styleOpt}
                    onClick={() => setSettings(prev => ({ ...prev, visualizerStyle: styleOpt }))}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase transition-colors cursor-pointer ${
                      settings.visualizerStyle === styleOpt ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {styleOpt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DISPLAY: Lyrics Karaoke Panel */}
        {activeTab === 'lyrics' && (
          <div className="flex-1 h-72 sm:h-96 rounded-2xl bg-slate-950/20 border border-slate-800/30 relative">
            <LyricsPanel 
              lyrics={currentSong.lyrics} 
              currentTime={currentTime} 
              onSeek={onSeek} 
              themeColor={activeThemeColor} 
            />
          </div>
        )}

        {/* DISPLAY: EQ and Sleep Settings */}
        {activeTab === 'equalizer' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
            
            {/* Equalizer Configuration */}
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/50 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles size={14} /> Equalizer Preset
                </h4>
                <span className="text-xs text-slate-400 font-mono font-semibold bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-800">
                  {settings.equalizerPreset}
                </span>
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-2 gap-2">
                {['Flat', 'Bass Booster', 'Vocal Enhancer', 'Electronic', 'Acoustic/Indie', 'Lofi Cozy'].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setSettings(prev => ({ ...prev, equalizerPreset: preset }))}
                    className={`text-xs font-semibold py-2 px-3 rounded-xl border transition-colors cursor-pointer text-left ${
                      settings.equalizerPreset === preset 
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' 
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 font-sans italic">
                *Synthesizer and streaming tracks are routed through our actual 3-band high-fidelity Web Audio filter engine.
              </p>
            </div>

            {/* Sleep Timer Configuration */}
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/50 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Timer size={14} /> Sleep Timer
                </h4>
                {sleepTimer && (
                  <span className="text-xs text-rose-400 font-mono font-bold bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-800 animate-pulse">
                    {formatTime(sleepTimer)} remaining
                  </span>
                )}
              </div>

              {/* Fast intervals */}
              <div className="grid grid-cols-2 gap-2">
                {[10, 20, 30, 60].map(mins => (
                  <button
                    key={mins}
                    onClick={() => onSetSleepTimer(mins)}
                    className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {mins < 60 ? `${mins} Mins` : '1 Hour'}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <form onSubmit={handleCustomTimerSubmit} className="flex gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
                <input
                  type="number"
                  placeholder="Custom minutes..."
                  value={customTimerVal}
                  onChange={(e) => setCustomTimerVal(e.target.value)}
                  className="flex-1 bg-transparent px-3 text-xs text-slate-100 outline-none border-none font-sans"
                  min="1"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Set
                </button>
              </form>

              {sleepTimer && (
                <button
                  onClick={() => onSetSleepTimer(null)}
                  className="w-full text-xs font-semibold text-rose-500 hover:text-rose-400 text-center py-1 bg-rose-500/10 rounded-xl hover:bg-rose-500/15 transition-colors cursor-pointer"
                >
                  Cancel Active Sleep Timer
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Song details */}
      <div className="flex justify-between items-end relative z-10 font-sans mt-auto">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white truncate font-sans">
            {currentSong.title}
          </h2>
          <p className="text-sm text-slate-400 mt-1 truncate font-sans">
            {currentSong.artist} <span className="text-slate-600 font-bold mx-1.5">•</span> <span className="text-slate-500">{currentSong.album}</span>
          </p>
        </div>

        {/* Favorite & Rating triggers */}
        <div className="flex gap-1.5">
          <button
            onClick={() => onToggleFavorite(currentSong.id)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              isFavorite 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-500 hover:scale-105' 
                : 'bg-slate-950/40 border-slate-800/85 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} className={isFavorite ? 'animate-heart' : ''} />
          </button>
          <button
            onClick={shareSong}
            className="p-3 rounded-2xl border border-slate-800/85 bg-slate-950/40 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer"
            title="Share Song link"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Interactive Progress Bar */}
      <div className="space-y-1.5 relative z-10 font-mono">
        <div className="relative w-full h-2 bg-slate-950/60 rounded-full cursor-pointer group">
          {/* Buffer progress bar */}
          <div className="absolute top-0 left-0 h-full w-full bg-slate-800/35 rounded-full transition-all"></div>
          
          {/* Playback progress bar */}
          <div 
            className="absolute top-0 left-0 h-full rounded-full transition-all"
            style={{ 
              width: `${(currentTime / currentSong.duration) * 100}%`,
              background: `linear-gradient(to right, ${activeThemeColor}, #4f46e5)`
            }}
          ></div>

          {/* Hidden HTML range slider to simplify seeking */}
          <input
            type="range"
            min="0"
            max={currentSong.duration}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex justify-between text-slate-500 text-[10px] font-bold font-mono uppercase tracking-wide">
          <span>{formatTime(currentTime)}</span>
          <span className="text-slate-400">{formatTime(currentSong.duration)}</span>
        </div>
      </div>

      {/* Main Playback Audio Controls Panel */}
      <div className="flex items-center justify-between gap-4 bg-slate-950/20 border border-slate-800/30 p-3 rounded-3xl relative z-10 font-sans mt-2">
        
        {/* Shuffle and Repeat */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleShuffle}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isShuffle ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Shuffle Playlist"
          >
            <Shuffle size={16} />
          </button>
          
          <button
            onClick={onToggleRepeat}
            className={`p-2.5 rounded-xl transition-all cursor-pointer relative ${
              repeatMode !== 'off' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={`Repeat: ${repeatMode === 'off' ? 'Off' : repeatMode === 'one' ? 'Repeat One' : 'Repeat All'}`}
          >
            <Repeat size={16} />
            {repeatMode === 'one' && (
              <span className="absolute -top-0.5 -right-0.5 bg-indigo-500 text-slate-950 text-[7px] font-extrabold px-1 rounded-full border border-slate-900">
                1
              </span>
            )}
          </button>
        </div>

        {/* Previous, Play/Pause, Next */}
        <div className="flex items-center gap-4">
          <button
            onClick={onPrevious}
            className="p-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition-all cursor-pointer"
            title="Previous Track"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={onPlayPause}
            className="w-14 h-14 rounded-full flex items-center justify-center hover:scale-108 active:scale-95 transition-all text-slate-950 shadow-xl cursor-pointer"
            style={{ 
              background: `linear-gradient(135deg, ${activeThemeColor}, #4f46e5)`,
              boxShadow: `0 8px 24px -4px ${activeThemeColor}60`
            }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={24} className="fill-slate-950 text-slate-950 ml-0" />
            ) : (
              <Play size={24} className="fill-slate-950 text-slate-950 ml-1" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition-all cursor-pointer"
            title="Next Track"
          >
            <SkipForward size={20} />
          </button>
        </div>

        {/* Volume management widget */}
        <div className="flex items-center gap-2 group/vol">
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <div className="w-16 h-1 bg-slate-800/80 rounded-full cursor-pointer relative transition-all group-hover/vol:w-24">
            <div 
              className="absolute top-0 left-0 h-full rounded-full bg-white"
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-[10px] text-slate-500 font-mono font-bold w-6 text-right">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>

      </div>
    </div>
  );
}
