/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: number;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string; // url or "synth:..." identifier
  lyrics: LyricLine[];
  themeColor: string; // primary branding hex color
  secondaryColor: string; // secondary neon accent
  rating: number; // 1-5 stars
  playCount: number;
  isSynthetic?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  isEditable?: boolean;
  coverUrl?: string;
}

export type RepeatMode = 'off' | 'one' | 'all';
export type VisualizerStyle = 'bars' | 'waves' | 'circular' | 'pulse';
export type EqualizerStyle = 'bars' | 'waves' | 'circular';
export type AppTheme = 'dark' | 'light' | 'dynamic';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export interface AppSettings {
  theme: AppTheme;
  animationSpeed: AnimationSpeed;
  playbackSpeed: number;
  visualizerStyle: VisualizerStyle;
  notificationsEnabled: boolean;
  equalizerPreset: string;
  defaultVolume: number;
  customCursorEnabled: boolean;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ListeningHistoryItem {
  id: string;
  songId: string;
  playedAt: number; // timestamp
}

export interface MusicStats {
  totalSongs: number;
  totalDuration: number; // seconds
  favoriteCount: number;
  mostPlayedSongId: string | null;
  totalListeningTime: number; // seconds
}
