/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Song, Playlist } from '../types';
import { Sparkles, Play, RefreshCw, ListMusic, Plus, ArrowRight } from 'lucide-react';

interface AISuggestionsProps {
  currentSong: Song | null;
  allSongs: Song[];
  playlists: Playlist[];
  onPlaySong: (song: Song) => void;
  onAddSongToPlaylist: (songId: string, playlistId: string) => void;
  toastNotification: (msg: string, type: 'info' | 'success') => void;
  activeThemeColor: string;
}

export default function AISuggestions({
  currentSong,
  allSongs,
  playlists,
  onPlaySong,
  onAddSongToPlaylist,
  toastNotification,
  activeThemeColor
}: AISuggestionsProps) {
  const [mood, setMood] = useState<'chill' | 'energetic' | 'cyberpunk' | 'melancholy'>('chill');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecs, setGeneratedRecs] = useState<Song[]>([]);
  const [aiExplanation, setAiExplanation] = useState('');

  const generateRecommendations = () => {
    setIsGenerating(true);

    setTimeout(() => {
      let filtered: Song[] = [];

      // Creative algorithmic matching based on selected "AI Mood"
      if (mood === 'chill') {
        filtered = allSongs.filter(s => s.genre.toLowerCase().includes('lofi') || s.genre.toLowerCase().includes('ambient') || s.genre.toLowerCase().includes('acoustic'));
        setAiExplanation("AI identified warm coffee chords and dust crackles. Recommended cozy acoustic & lofi tracks.");
      } else if (mood === 'energetic') {
        filtered = allSongs.filter(s => s.genre.toLowerCase().includes('synthwave') || s.genre.toLowerCase().includes('electro') || s.genre.toLowerCase().includes('rock'));
        setAiExplanation("AI detected high heart-rate BPM and energetic synth melodies. Recommended highway driving tracks.");
      } else if (mood === 'cyberpunk') {
        filtered = allSongs.filter(s => s.genre.toLowerCase().includes('synthwave') || s.genre.toLowerCase().includes('cyber') || s.id.includes('cyberpunk'));
        setAiExplanation("AI scanned grid coordinates and cyberbeats. Recommending deep cybernetic synthesizers.");
      } else {
        filtered = allSongs.filter(s => s.year < 2024 || s.genre.toLowerCase().includes('lofi') || s.genre.toLowerCase().includes('ambient'));
        setAiExplanation("AI picked reflective analog warmth and retro wave signatures.");
      }

      // Shuffle and take top 2-3
      const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 3);
      setGeneratedRecs(shuffled);
      setIsGenerating(false);
      toastNotification('AI Playlist generated successfully!', 'success');
    }, 1200);
  };

  return (
    <div 
      id="ai-playlist-generator"
      className="glass-panel rounded-3xl p-5 border-slate-800/80 shadow-xl space-y-4 font-sans relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] pointer-events-none"></div>

      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-400 animate-pulse" />
          AI Playlist Recommender
        </h4>
        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          Smart Suggest
        </span>
      </div>

      {/* Mood Picker */}
      <div className="space-y-2">
        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Select AI Seed Mood</div>
        <div className="grid grid-cols-4 gap-1.5">
          {(['chill', 'energetic', 'cyberpunk', 'melancholy'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`text-[10px] font-bold py-2 rounded-xl uppercase transition-all border cursor-pointer ${
                mood === m 
                  ? 'bg-orange-500/25 border-orange-500/50 text-orange-400 font-extrabold shadow-[0_0_12px_rgba(255,78,0,0.15)]' 
                  : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={generateRecommendations}
        disabled={isGenerating}
        className="w-full bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-500 hover:to-orange-300 text-white font-bold py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_-3px_rgba(255,78,0,0.3)]"
      >
        <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
        {isGenerating ? 'AI Engine Scanning...' : 'Generate AI Playlist'}
      </button>

      {/* Generated Suggestions */}
      {generatedRecs.length > 0 && !isGenerating && (
        <div className="space-y-3 pt-2">
          <div className="text-xs text-orange-400 font-semibold italic flex items-center gap-1.5 leading-relaxed bg-orange-950/20 border border-orange-900/10 p-3 rounded-2xl">
            <span>✨</span>
            <span className="text-[11px]">{aiExplanation}</span>
          </div>

          <div className="space-y-2">
            {generatedRecs.map(song => (
              <div 
                key={song.id}
                className="flex items-center gap-3 p-2 bg-slate-950/30 hover:bg-slate-950/50 border border-slate-900 rounded-2xl transition-all"
              >
                <img src={song.coverUrl} alt="" className="w-9 h-9 rounded-lg object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate">{song.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">{song.artist}</div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Play */}
                  <button
                    onClick={() => onPlaySong(song)}
                    className="p-1.5 bg-orange-600 hover:bg-orange-500 rounded-xl text-white transition-colors cursor-pointer"
                    title="Play Track"
                  >
                    <Play size={10} fill="currentColor" />
                  </button>

                  {/* Add to current custom playlists */}
                  {playlists.length > 0 && (
                    <button
                      onClick={() => {
                        // Add to first available editable playlist
                        const targetPlaylist = playlists.find(p => p.isEditable);
                        if (targetPlaylist) {
                          onAddSongToPlaylist(song.id, targetPlaylist.id);
                        } else {
                          toastNotification('Please create a custom playlist first!', 'info');
                        }
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Add to Custom Playlist"
                    >
                      <Plus size={10} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
