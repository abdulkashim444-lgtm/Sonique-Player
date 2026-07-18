/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Song, Playlist, MusicStats, ListeningHistoryItem } from '../types';
import { 
  Heart, Search, Plus, Trash2, Calendar, FileAudio, Clock, BarChart2, ListMusic, 
  History, ArrowRightLeft, FileJson, LogIn, ExternalLink, RefreshCw, Star
} from 'lucide-react';

interface SidebarProps {
  songs: Song[];
  playlists: Playlist[];
  currentSong: Song | null;
  isPlaying: boolean;
  favorites: string[];
  history: ListeningHistoryItem[];
  stats: MusicStats;
  currentTab: 'queue' | 'favorites' | 'playlists' | 'stats' | 'history';
  setCurrentTab: (tab: 'queue' | 'favorites' | 'playlists' | 'stats' | 'history') => void;
  onPlaySong: (song: Song) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onRateSong: (id: string, rating: number) => void;
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (id: string) => void;
  onPlayPlaylist: (playlist: Playlist) => void;
  onImportPlaylists: (jsonStr: string) => void;
  onExportPlaylists: () => void;
  activePlaylistId: string | null;
}

export default function Sidebar({
  songs,
  playlists,
  currentSong,
  isPlaying,
  favorites,
  history,
  stats,
  currentTab,
  setCurrentTab,
  onPlaySong,
  onToggleFavorite,
  onRateSong,
  onCreatePlaylist,
  onDeletePlaylist,
  onPlayPlaylist,
  onImportPlaylists,
  onExportPlaylists,
  activePlaylistId
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  // Filter songs based on search
  const filteredSongs = songs.filter(song => {
    const term = searchTerm.toLowerCase();
    return (
      song.title.toLowerCase().includes(term) ||
      song.artist.toLowerCase().includes(term) ||
      song.album.toLowerCase().includes(term) ||
      song.genre.toLowerCase().includes(term)
    );
  });

  // Filter favorites
  const favoriteSongs = songs.filter(song => favorites.includes(song.id));

  // Get active queue/playlist songs
  let queueSongs = filteredSongs;
  if (activePlaylistId) {
    const activePlaylist = playlists.find(p => p.id === activePlaylistId);
    if (activePlaylist) {
      queueSongs = songs.filter(song => activePlaylist.songIds.includes(song.id))
                       .filter(song => {
                         const term = searchTerm.toLowerCase();
                         return (
                           song.title.toLowerCase().includes(term) ||
                           song.artist.toLowerCase().includes(term) ||
                           song.album.toLowerCase().includes(term)
                         );
                       });
    }
  }

  // Handle playlist submission
  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowNewPlaylistInput(false);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <aside 
      id="app-sidebar-panel"
      className="w-full lg:w-96 glass-panel rounded-3xl p-6 flex flex-col h-full border-slate-800 text-slate-100 shadow-2xl transition-all duration-300 relative z-10"
    >
      {/* Search Input */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Search tracks, artists, albums..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')} 
            className="absolute right-3 top-3 text-xs text-slate-500 hover:text-slate-300 font-sans cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 mb-6 font-sans">
        <button
          onClick={() => setCurrentTab('queue')}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-all cursor-pointer ${
            currentTab === 'queue' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Tracks
        </button>
        <button
          onClick={() => setCurrentTab('favorites')}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-all cursor-pointer ${
            currentTab === 'favorites' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Liked
        </button>
        <button
          onClick={() => setCurrentTab('playlists')}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-all cursor-pointer ${
            currentTab === 'playlists' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Playlists
        </button>
        <button
          onClick={() => setCurrentTab('stats')}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-all cursor-pointer ${
            currentTab === 'stats' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Stats
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        
        {/* TAB 1: Queue / Songs List */}
        {currentTab === 'queue' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold px-2 uppercase tracking-widest">
              <span>{activePlaylistId ? 'Playing Playlist' : 'All Available Tracks'}</span>
              <span>{queueSongs.length} items</span>
            </div>
            
            {queueSongs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-sans text-sm">
                No matching tracks found. Try searching something else!
              </div>
            ) : (
              queueSongs.map((song, idx) => {
                const isActive = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl group hover:bg-slate-800/40 border border-transparent hover:border-slate-800 transition-all cursor-pointer ${
                      isActive ? 'bg-slate-800/60 border-slate-700/50 shadow-lg' : ''
                    }`}
                    onClick={() => onPlaySong(song)}
                  >
                    {/* Index or active animation */}
                    <div className="w-6 text-center text-sm font-semibold text-slate-500 flex items-center justify-center">
                      {isActive && isPlaying ? (
                        <div className="flex items-end gap-0.5 h-3.5 w-3.5">
                          <span className="bg-indigo-400 w-0.5 rounded-full animate-bounce h-full" style={{ animationDelay: '0.1s', animationDuration: '0.8s' }}></span>
                          <span className="bg-indigo-400 w-0.5 rounded-full animate-bounce h-full" style={{ animationDelay: '0.3s', animationDuration: '1.2s' }}></span>
                          <span className="bg-indigo-400 w-0.5 rounded-full animate-bounce h-full" style={{ animationDelay: '0.5s', animationDuration: '1s' }}></span>
                        </div>
                      ) : (
                        <span className="group-hover:hidden">{idx + 1}</span>
                      )}
                      {/* Play button hover */}
                      <span className="hidden group-hover:inline text-indigo-400">▶</span>
                    </div>

                    {/* Album Art */}
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover shadow-md group-hover:scale-105 transition-all"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold truncate ${isActive ? 'text-indigo-400' : 'text-slate-100'}`}>
                        {song.title}
                      </div>
                      <div className="text-xs text-slate-400 truncate group-hover:text-slate-300 transition-colors">
                        {song.artist}
                      </div>
                    </div>

                    {/* Interactive Section */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* Rating widget */}
                      <div className="hidden group-hover:flex items-center gap-0.5">
                        {[1,2,3,4,5].map(star => (
                          <button
                            key={star}
                            onClick={() => onRateSong(song.id, star)}
                            className="p-0.5 cursor-pointer text-slate-500 hover:text-amber-400 transition-colors"
                          >
                            <Star size={10} fill={star <= song.rating ? 'currentColor' : 'none'} className={star <= song.rating ? 'text-amber-400' : ''} />
                          </button>
                        ))}
                      </div>

                      {/* Favorites */}
                      <button
                        onClick={(e) => onToggleFavorite(song.id, e)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          favorites.includes(song.id) 
                            ? 'text-rose-500 hover:bg-rose-500/10' 
                            : 'text-slate-500 hover:text-slate-200 hover:bg-slate-700/30'
                        }`}
                      >
                        <Heart size={14} fill={favorites.includes(song.id) ? 'currentColor' : 'none'} />
                      </button>
                      <span className="text-xs text-slate-500 font-mono pr-2">{formatDuration(song.duration)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: Liked Songs */}
        {currentTab === 'favorites' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold px-2 uppercase tracking-widest">
              <span>Your Library</span>
              <span>{favoriteSongs.length} favorites</span>
            </div>

            {favoriteSongs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-sans text-sm px-4">
                <Heart size={32} className="mx-auto mb-3 text-slate-600 animate-pulse" />
                No favorites saved yet. Press the heart icon on any song!
              </div>
            ) : (
              favoriteSongs.map((song) => {
                const isActive = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl group hover:bg-slate-800/40 border border-transparent hover:border-slate-800 transition-all cursor-pointer ${
                      isActive ? 'bg-slate-800/60 border-slate-700/50 shadow-lg' : ''
                    }`}
                    onClick={() => onPlaySong(song)}
                  >
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover shadow-md"
                    />

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold truncate ${isActive ? 'text-indigo-400' : 'text-slate-100'}`}>
                        {song.title}
                      </div>
                      <div className="text-xs text-slate-400 truncate">{song.artist}</div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => onToggleFavorite(song.id, e)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Heart size={14} fill="currentColor" />
                      </button>
                      <span className="text-xs text-slate-500 font-mono pr-2">{formatDuration(song.duration)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: Playlists Manager */}
        {currentTab === 'playlists' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Your Playlists</span>
              <button
                onClick={() => setShowNewPlaylistInput(!showNewPlaylistInput)}
                className="text-xs text-indigo-400 font-semibold flex items-center gap-1 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <Plus size={14} /> Create New
              </button>
            </div>

            {/* Create Input Box */}
            {showNewPlaylistInput && (
              <form onSubmit={handleCreatePlaylistSubmit} className="flex gap-2 p-2 bg-slate-950/40 border border-slate-800 rounded-2xl">
                <input
                  type="text"
                  placeholder="Playlist title..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="flex-1 bg-transparent px-3 text-sm text-slate-100 outline-none focus:ring-0 border-none font-sans"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  Save
                </button>
              </form>
            )}

            {/* List of Custom Playlists */}
            <div className="space-y-3">
              {playlists.map((playlist) => {
                const count = playlist.songIds.length;
                const isActive = activePlaylistId === playlist.id;

                return (
                  <div
                    key={playlist.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-800/40 border border-transparent hover:border-slate-800 transition-all cursor-pointer ${
                      isActive ? 'bg-slate-800/60 border-slate-700/50 shadow-lg' : ''
                    }`}
                    onClick={() => onPlayPlaylist(playlist)}
                  >
                    {/* Placeholder custom cover using nice neon gradient */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-rose-500 shadow-md">
                      <ListMusic size={20} className="text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold truncate ${isActive ? 'text-indigo-400' : 'text-slate-100'}`}>
                        {playlist.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {count} {count === 1 ? 'song' : 'songs'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {playlist.isEditable && (
                        <button
                          onClick={() => onDeletePlaylist(playlist.id)}
                          className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
                          title="Delete Playlist"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900/60 text-indigo-400 text-[10px] tracking-wide uppercase border border-slate-800">
                        Play
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* JSON Import/Export panel */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex justify-between items-center px-1 mb-3">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">JSON Sync</span>
                <div className="flex gap-2">
                  <button
                    onClick={onExportPlaylists}
                    className="text-slate-400 hover:text-indigo-400 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Export Playlists"
                  >
                    <ArrowRightLeft size={12} /> Export
                  </button>
                  <button
                    onClick={() => setShowImportBox(!showImportBox)}
                    className="text-slate-400 hover:text-indigo-400 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileJson size={12} /> Import
                  </button>
                </div>
              </div>

              {showImportBox && (
                <div className="p-3 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-2">
                  <textarea
                    placeholder="Paste playlist JSON config..."
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    className="w-full h-24 bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => {
                      onImportPlaylists(importJson);
                      setImportJson('');
                      setShowImportBox(false);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <LogIn size={12} /> Load Playlist JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Listening Stats */}
        {currentTab === 'stats' && (
          <div className="space-y-5 font-sans">
            <div className="text-xs text-slate-500 font-bold px-2 uppercase tracking-widest">Listening Insights</div>

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 hover:border-slate-800 transition-colors flex flex-col justify-between">
                <BarChart2 size={18} className="text-indigo-400 mb-2" />
                <div>
                  <div className="text-xs text-slate-400 font-medium">Tracks Played</div>
                  <div className="text-2xl font-bold text-slate-100">{stats.totalSongs}</div>
                </div>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 hover:border-slate-800 transition-colors flex flex-col justify-between">
                <Clock size={18} className="text-rose-400 mb-2" />
                <div>
                  <div className="text-xs text-slate-400 font-medium">Session Time</div>
                  <div className="text-xl font-bold text-slate-100 truncate">{formatDuration(stats.totalListeningTime)}</div>
                </div>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 hover:border-slate-800 transition-colors flex flex-col justify-between">
                <Heart size={18} className="text-emerald-400 mb-2" />
                <div>
                  <div className="text-xs text-slate-400 font-medium">Liked Count</div>
                  <div className="text-2xl font-bold text-slate-100">{stats.favoriteCount}</div>
                </div>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 hover:border-slate-800 transition-colors flex flex-col justify-between">
                <FileAudio size={18} className="text-cyan-400 mb-2" />
                <div>
                  <div className="text-xs text-slate-400 font-medium">Total Library</div>
                  <div className="text-2xl font-bold text-slate-100">{songs.length}</div>
                </div>
              </div>
            </div>

            {/* Favorite Song */}
            {stats.mostPlayedSongId && (
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                <div className="text-xs text-indigo-400 font-bold mb-2 uppercase tracking-wide">Top Track Info</div>
                {(() => {
                  const topSong = songs.find(s => s.id === stats.mostPlayedSongId);
                  if (!topSong) return null;
                  return (
                    <div className="flex items-center gap-3">
                      <img src={topSong.coverUrl} alt="" className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-100 truncate">{topSong.title}</div>
                        <div className="text-xs text-slate-400 truncate">{topSong.artist}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-indigo-400 font-bold">{topSong.playCount}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Plays</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Dynamic system info */}
            <div className="text-center p-4 bg-indigo-950/10 rounded-2xl border border-indigo-900/10 text-xs text-indigo-400 font-sans">
              🌟 Pure Client-Side Audio Synth Engine Active
            </div>
          </div>
        )}
      </div>

      {/* Footer active indicator */}
      {currentSong && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold truncate">
              Now: {currentSong.title}
            </span>
          </div>
          <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-indigo-400">
            320kbps
          </span>
        </div>
      )}
    </aside>
  );
}
