/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Song, Playlist, RepeatMode, AppSettings, ToastMessage, ListeningHistoryItem, MusicStats, AppTheme } from './types';
import { INITIAL_SONGS } from './data/songs';
import { activeAudioEngine } from './utils/audioEngine';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainPlayer from './components/MainPlayer';
import AISuggestions from './components/AISuggestions';
import Toast from './components/Toast';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import SettingsPanel from './components/SettingsPanel';

const STORAGE_KEYS = {
  SETTINGS: 'sonique_settings',
  FAVORITES: 'sonique_favorites',
  PLAYLISTS: 'sonique_playlists',
  HISTORY: 'sonique_history',
  STATS: 'sonique_stats',
  RATINGS: 'sonique_ratings',
  PLAY_COUNTS: 'sonique_play_counts'
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dynamic',
  animationSpeed: 'normal',
  playbackSpeed: 1.0,
  visualizerStyle: 'bars',
  notificationsEnabled: true,
  equalizerPreset: 'Flat',
  defaultVolume: 0.7,
  customCursorEnabled: true
};

export default function App() {
  // --- Persistent States ---
  const [songs, setSongs] = useState<Song[]>(() => {
    const localRatings = localStorage.getItem(STORAGE_KEYS.RATINGS);
    const localPlays = localStorage.getItem(STORAGE_KEYS.PLAY_COUNTS);
    
    const ratings = localRatings ? JSON.parse(localRatings) : {};
    const playCounts = localPlays ? JSON.parse(localPlays) : {};

    return INITIAL_SONGS.map(song => ({
      ...song,
      rating: ratings[song.id] ?? song.rating,
      playCount: playCounts[song.id] ?? song.playCount
    }));
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return saved ? JSON.parse(saved) : [];
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
    if (saved) return JSON.parse(saved);

    // Initial Default Playlists
    return [
      {
        id: 'synthwave-essentials',
        name: 'Hyperdrive Synthwave',
        songIds: ['cyberpunk-neon', 'chillwave-sunset'],
        isEditable: false
      },
      {
        id: 'lofi-study-room',
        name: 'Cozy Study Lofi',
        songIds: ['lofi-rain', 'ambient-dream'],
        isEditable: false
      },
      {
        id: 'user-playlist-1',
        name: 'My Custom Jams',
        songIds: [],
        isEditable: true
      }
    ];
  });

  const [history, setHistory] = useState<ListeningHistoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<MusicStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    if (saved) return JSON.parse(saved);

    return {
      totalSongs: 0,
      totalDuration: 0,
      favoriteCount: 0,
      mostPlayedSongId: null,
      totalListeningTime: 0
    };
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // --- UI and Playback States ---
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(settings.defaultVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);

  // --- Modals and Overlays ---
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [currentTab, setCurrentTab] = useState<'queue' | 'favorites' | 'playlists' | 'stats' | 'history'>('queue');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- Cursor Tracking ---
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);

  // --- Sleep Timer ---
  const [sleepTimer, setSleepTimer] = useState<number | null>(null); // time in seconds remaining

  // --- References ---
  const activeSongIndexRef = useRef<number>(-1);
  const playedHistoryCountRef = useRef<number>(0);

  // --- Dynamic Color Theme Computations ---
  // Default dark violet brand values if no dynamic colors are loaded
  const activeThemeColor = settings.theme === 'dynamic' && currentSong 
    ? currentSong.themeColor 
    : settings.theme === 'light' 
    ? '#4f46e5' 
    : '#818cf8';

  // --- Trigger Notifications Helper ---
  const addToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    if (!settings.notificationsEnabled) return;
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- LocalStorage Synchronization ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    activeAudioEngine.setVolume(isMuted ? 0 : volume);
  }, [settings, volume, isMuted]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    // Update stats favorite count
    setStats(prev => ({
      ...prev,
      favoriteCount: favorites.length
    }));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }, [stats]);

  // --- Handle Custom Cursor Movements ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Check if hovering interactive controls
      const target = e.target as HTMLElement;
      const isClickable = target && (
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.tagName === 'INPUT' || 
        target.closest('button') || 
        target.closest('a') ||
        target.style.cursor === 'pointer'
      );
      setIsHoveringClickable(!!isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // --- Sleep Timer Counting Loop ---
  useEffect(() => {
    if (sleepTimer === null) return;

    const interval = setInterval(() => {
      setSleepTimer(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          activeAudioEngine.pause();
          setIsPlaying(false);
          addToast('Sleep timer reached. Playback suspended.', 'warning');
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimer]);

  // --- Sound Engine Hookup ---
  useEffect(() => {
    // Volume initialized
    activeAudioEngine.setVolume(volume);

    // Audio Engine updates state
    activeAudioEngine.onTimeUpdate = (time) => {
      setCurrentTime(time);
    };

    activeAudioEngine.onEnded = () => {
      handleNextTrackAuto();
    };

    // Equalizer preset hook
    activeAudioEngine.applyPreset(settings.equalizerPreset);
  }, [settings.equalizerPreset]);

  // Increment total session listening time periodically while playing
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalListeningTime: prev.totalListeningTime + 1
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // --- Playback Handlers ---
  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentTime(0);

    // Update active index
    const songIndex = songs.findIndex(s => s.id === song.id);
    activeSongIndexRef.current = songIndex;

    // Track play counts
    const updatedSongs = songs.map(s => {
      if (s.id === song.id) {
        const nextPlays = s.playCount + 1;
        
        // Save play count to local
        const localPlays = localStorage.getItem(STORAGE_KEYS.PLAY_COUNTS);
        const playsObj = localPlays ? JSON.parse(localPlays) : {};
        playsObj[song.id] = nextPlays;
        localStorage.setItem(STORAGE_KEYS.PLAY_COUNTS, JSON.stringify(playsObj));

        return { ...s, playCount: nextPlays };
      }
      return s;
    });
    setSongs(updatedSongs);

    // Update History log
    const historyItem: ListeningHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      songId: song.id,
      playedAt: Date.now()
    };
    setHistory(prev => [historyItem, ...prev].slice(0, 30)); // limit 30 logs

    // Increment overall stats
    playedHistoryCountRef.current += 1;
    setStats(prev => {
      // Find top song
      let topSongId = song.id;
      const sorted = [...updatedSongs].sort((a,b) => b.playCount - a.playCount);
      if (sorted.length > 0) topSongId = sorted[0].id;

      return {
        ...prev,
        totalSongs: prev.totalSongs + 1,
        mostPlayedSongId: topSongId
      };
    });

    activeAudioEngine.play(song.audioUrl, song.duration);
    addToast(`Playing "${song.title}"`, 'success');
  };

  const handlePlayPause = () => {
    if (!currentSong) {
      // Begin first song in catalog
      if (songs.length > 0) {
        handlePlaySong(songs[0]);
      }
      return;
    }

    if (isPlaying) {
      activeAudioEngine.pause();
      setIsPlaying(false);
      addToast('Playback paused', 'info');
    } else {
      activeAudioEngine.resume();
      setIsPlaying(true);
      addToast('Playback resumed', 'success');
    }
  };

  const handleNextTrack = () => {
    if (songs.length === 0) return;

    let nextIndex = activeSongIndexRef.current + 1;

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else if (nextIndex >= songs.length) {
      nextIndex = 0; // wrap around
    }

    handlePlaySong(songs[nextIndex]);
  };

  const handleNextTrackAuto = () => {
    if (repeatMode === 'one') {
      // Repeat the exact same song
      if (currentSong) {
        handlePlaySong(currentSong);
      }
    } else {
      handleNextTrack();
    }
  };

  const handlePreviousTrack = () => {
    if (songs.length === 0) return;

    let prevIndex = activeSongIndexRef.current - 1;

    if (prevIndex < 0) {
      prevIndex = songs.length - 1; // back around to end
    }

    handlePlaySong(songs[prevIndex]);
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    activeAudioEngine.seek(seconds);
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    setIsMuted(false);
    activeAudioEngine.setVolume(vol);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    activeAudioEngine.setVolume(nextMuted ? 0 : volume);
    addToast(nextMuted ? 'Volume muted' : 'Volume unmuted', 'info');
  };

  const handleToggleShuffle = () => {
    const nextShuffle = !isShuffle;
    setIsShuffle(nextShuffle);
    addToast(nextShuffle ? 'Shuffle enabled' : 'Shuffle disabled', 'info');
  };

  const handleToggleRepeat = () => {
    let nextRepeat: RepeatMode = 'off';
    if (repeatMode === 'off') nextRepeat = 'all';
    else if (repeatMode === 'all') nextRepeat = 'one';

    setRepeatMode(nextRepeat);
    addToast(`Repeat set to: ${nextRepeat}`, 'info');
  };

  // --- Voice Commands Broker ---
  const handleVoiceCommand = (command: string) => {
    const cleanCommand = command.trim();
    if (cleanCommand.includes('play') || cleanCommand.includes('resume') || cleanCommand.includes('start')) {
      if (!isPlaying) handlePlayPause();
    } else if (cleanCommand.includes('pause') || cleanCommand.includes('stop') || cleanCommand.includes('hold')) {
      if (isPlaying) handlePlayPause();
    } else if (cleanCommand.includes('next') || cleanCommand.includes('forward') || cleanCommand.includes('skip')) {
      handleNextTrack();
    } else if (cleanCommand.includes('previous') || cleanCommand.includes('back')) {
      handlePreviousTrack();
    } else if (cleanCommand.includes('mute') || cleanCommand.includes('quiet')) {
      if (!isMuted) handleToggleMute();
    } else if (cleanCommand.includes('unmute') || cleanCommand.includes('sound')) {
      if (isMuted) handleToggleMute();
    } else {
      addToast(`Voice control heard: "${cleanCommand}"`, 'info');
    }
  };

  // --- Keyboard Shortcuts Hooks ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkeys when editing inputs or textareas
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePreviousTrack();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNextTrack();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(1.0, volume + 0.05));
          addToast(`Volume: ${Math.round(Math.min(1.0, volume + 0.05) * 100)}%`, 'info');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0.0, volume - 0.05));
          addToast(`Volume: ${Math.round(Math.max(0.0, volume - 0.05) * 100)}%`, 'info');
          break;
        case 'KeyM':
          handleToggleMute();
          break;
        case 'KeyS':
          handleToggleShuffle();
          break;
        case 'KeyR':
          handleToggleRepeat();
          break;
        case 'KeyF':
          if (currentSong) {
            handleToggleFavorite(currentSong.id);
          }
          break;
        case 'KeyL':
          // Toggle lyrics main player view
          const lyricsButton = document.querySelector('[id*="lyrics"]') as HTMLButtonElement;
          if (lyricsButton) lyricsButton.click();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSong, isPlaying, volume, isShuffle, repeatMode, favorites]);

  // --- Other Interactive Actions ---
  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    let nextFavs;
    if (favorites.includes(id)) {
      nextFavs = favorites.filter(favId => favId !== id);
      addToast('Removed from Favorites', 'info');
    } else {
      nextFavs = [...favorites, id];
      addToast('Added to Favorites', 'success');
    }
    setFavorites(nextFavs);
  };

  const handleRateSong = (id: string, rating: number) => {
    const updatedSongs = songs.map(s => {
      if (s.id === id) {
        // Save rating
        const localRatings = localStorage.getItem(STORAGE_KEYS.RATINGS);
        const ratingsObj = localRatings ? JSON.parse(localRatings) : {};
        ratingsObj[id] = rating;
        localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratingsObj));

        return { ...s, rating };
      }
      return s;
    });
    setSongs(updatedSongs);
    addToast(`Rated track ${rating} Stars!`, 'success');
  };

  const handleCreatePlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      songIds: [],
      isEditable: true
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    addToast(`Created playlist "${name}"`, 'success');
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    if (activePlaylistId === id) setActivePlaylistId(null);
    addToast('Playlist deleted', 'info');
  };

  const handleAddSongToPlaylist = (songId: string, playlistId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        if (p.songIds.includes(songId)) {
          addToast('Track already in this playlist', 'warning');
          return p;
        }
        addToast('Track added to playlist', 'success');
        return { ...p, songIds: [...p.songIds, songId] };
      }
      return p;
    }));
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    setActivePlaylistId(playlist.id);
    setCurrentTab('queue');
    if (playlist.songIds.length > 0) {
      // Find the first song
      const firstSong = songs.find(s => s.id === playlist.songIds[0]);
      if (firstSong) handlePlaySong(firstSong);
    } else {
      addToast(`Playlist "${playlist.name}" is empty. Add songs first!`, 'info');
    }
  };

  const handleSetSleepTimer = (minutes: number | null) => {
    if (minutes === null) {
      setSleepTimer(null);
      addToast('Sleep timer cancelled', 'info');
    } else {
      setSleepTimer(minutes * 60);
      addToast(`Sleep timer set for ${minutes} minutes`, 'success');
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to reset all customized configurations? This removes custom playlists, statistics, ratings and favorites.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // --- Import/Export playlist JSON ---
  const handleExportPlaylists = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(playlists));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "sonique_playlists_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Playlists exported to JSON!', 'success');
  };

  const handleImportPlaylists = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        setPlaylists(prev => [...prev, ...parsed]);
        addToast('Playlists imported successfully!', 'success');
      } else {
        addToast('Invalid playlist array format.', 'error');
      }
    } catch (e) {
      addToast('Parsing error. Please verify the JSON code.', 'error');
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
        addToast('Entered Fullscreen Mode', 'success');
      }).catch(e => console.warn(e));
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
      addToast('Exited Fullscreen Mode', 'info');
    }
  };

  const handleTogglePictureInPicture = () => {
    // Check if PiP is supported on canvas stream
    const canvas = document.getElementById('audio-visualizer-canvas') as HTMLCanvasElement;
    if (canvas && (canvas as any).captureStream) {
      // Create off-screen video to pipe the visualizer stream
      const video = document.createElement('video');
      video.muted = true;
      video.srcObject = (canvas as any).captureStream();
      video.play().then(() => {
        (video as any).requestPictureInPicture()
          .then(() => addToast('Picture-in-picture stream loaded!', 'success'))
          .catch((e: any) => console.warn(e));
      }).catch(e => console.warn(e));
    } else {
      addToast('Canvas stream pip not supported on your browser.', 'warning');
    }
  };

  return (
    <div 
      id="sonique-root-frame"
      className={`min-h-screen text-slate-100 flex flex-col p-4 md:p-6 transition-colors duration-700 relative overflow-hidden select-none bg-slate-950`}
      style={{
        background: settings.theme === 'light' 
          ? '#f8fafc' 
          : 'transparent'
      }}
    >
      {/* Immersive Atmosphere Background */}
      {settings.theme !== 'light' && <div className="atmosphere" />}
      {/* Dynamic system custom cursor */}
      {settings.customCursorEnabled && (
        <>
          <div 
            className="custom-cursor hidden lg:block" 
            style={{ 
              left: `${mousePos.x}px`, 
              top: `${mousePos.y}px`,
              borderColor: activeThemeColor,
              transform: `translate(-50%, -50%) scale(${isHoveringClickable ? 1.5 : 1})`,
              backgroundColor: isHoveringClickable ? `${activeThemeColor}20` : 'transparent'
            }}
          ></div>
          <div 
            className="custom-cursor-dot hidden lg:block" 
            style={{ 
              left: `${mousePos.x}px`, 
              top: `${mousePos.y}px`,
              backgroundColor: activeThemeColor
            }}
          ></div>
        </>
      )}

      {/* Floating Dynamic Particle Background (Synthesizer Beat Reactive) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: 15 }).map((_, idx) => (
          <div
            key={idx}
            className="particle"
            style={{
              left: `${(idx * 7) + 5}%`,
              '--delay': `${idx * 0.8}s`,
              '--duration': `${12 + (idx % 6)}s`,
              width: `${15 + (idx % 3) * 15}px`,
              height: `${15 + (idx % 3) * 15}px`,
              backgroundColor: activeThemeColor + '10',
              boxShadow: isPlaying ? `0 0 10px ${activeThemeColor}20` : 'none'
            } as React.CSSProperties}
          ></div>
        ))}
      </div>

      {/* Main Glass Layout Frame */}
      <div className="flex-1 flex flex-col gap-6 max-w-7xl mx-auto w-full relative z-10 min-h-0">
        
        {/* Navigation Header */}
        <Header
          theme={settings.theme}
          setTheme={(theme) => setSettings(prev => ({ ...prev, theme }))}
          onOpenSettings={() => setShowSettings(true)}
          onOpenShortcuts={() => setShowShortcuts(true)}
          onVoiceCommand={handleVoiceCommand}
          activeThemeColor={activeThemeColor}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onTogglePictureInPicture={handleTogglePictureInPicture}
          toastNotification={addToast}
        />

        {/* Content Section: Sidebar Left, Active Player Right */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 items-stretch">
          
          {/* Main Visual Vinyl and Control Center */}
          <div className="flex-1 flex flex-col gap-6 min-h-0">
            <MainPlayer
              currentSong={currentSong}
              isPlaying={isPlaying}
              currentTime={currentTime}
              onPlayPause={handlePlayPause}
              onNext={handleNextTrack}
              onPrevious={handlePreviousTrack}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
              volume={volume}
              isMuted={isMuted}
              isShuffle={isShuffle}
              onToggleShuffle={handleToggleShuffle}
              repeatMode={repeatMode}
              onToggleRepeat={handleToggleRepeat}
              onToggleFavorite={(id) => handleToggleFavorite(id)}
              favorites={favorites}
              onRateSong={handleRateSong}
              settings={settings}
              setSettings={setSettings}
              sleepTimer={sleepTimer}
              onSetSleepTimer={handleSetSleepTimer}
              activeThemeColor={activeThemeColor}
            />

            {/* Smart Suggestions */}
            <AISuggestions
              currentSong={currentSong}
              allSongs={songs}
              playlists={playlists}
              onPlaySong={handlePlaySong}
              onAddSongToPlaylist={handleAddSongToPlaylist}
              toastNotification={addToast}
              activeThemeColor={activeThemeColor}
            />
          </div>

          {/* Right Playlist Catalog and Listening Stats */}
          <Sidebar
            songs={songs}
            playlists={playlists}
            currentSong={currentSong}
            isPlaying={isPlaying}
            favorites={favorites}
            history={history}
            stats={stats}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            onPlaySong={handlePlaySong}
            onToggleFavorite={handleToggleFavorite}
            onRateSong={handleRateSong}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onPlayPlaylist={handlePlayPlaylist}
            onImportPlaylists={handleImportPlaylists}
            onExportPlaylists={handleExportPlaylists}
            activePlaylistId={activePlaylistId}
          />

        </div>
      </div>

      {/* Settings Modal */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        setSettings={setSettings}
        onClearCache={handleClearCache}
        activeThemeColor={activeThemeColor}
      />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsHelp
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Toast Overlay Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
