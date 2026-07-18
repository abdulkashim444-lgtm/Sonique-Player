/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Song } from '../types';

export const INITIAL_SONGS: Song[] = [
  {
    id: 'cyberpunk-neon',
    title: 'Neon Horizon',
    artist: 'RetroFuture Synth',
    album: 'Arcade Odyssey',
    genre: 'Synthwave',
    year: 2024,
    duration: 180,
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop',
    audioUrl: 'synth:neon',
    themeColor: '#f43f5e', // Rose 500
    secondaryColor: '#3b82f6', // Blue 500
    rating: 5,
    playCount: 42,
    isSynthetic: true,
    lyrics: [
      { time: 0, text: '🎵 (Intro Synthesizer - Cyberbeat Rising) 🎵' },
      { time: 8, text: 'Glowing grids across the night...' },
      { time: 16, text: 'Chasing down the neon lights.' },
      { time: 24, text: 'In this digital domain,' },
      { time: 32, text: 'We are free from all the pain.' },
      { time: 40, text: '🎵 (Melodic Chorus Hook) 🎵' },
      { time: 48, text: 'Ride the wave, neon horizon!' },
      { time: 56, text: 'Stars collide, a new sun is rising.' },
      { time: 64, text: 'Synthesized and wired in gold,' },
      { time: 72, text: 'Stories of the future told.' },
      { time: 80, text: '🎵 (Tempo Shift - Arpeggiator Solo) 🎵' },
      { time: 96, text: 'Running through the virtual stream,' },
      { time: 104, text: 'Living in a modern dream.' },
      { time: 112, text: 'Hold your breath, don\'t look behind,' },
      { time: 120, text: 'Infinite spaces in our mind.' },
      { time: 128, text: '🎵 (Main Theme Chorus Reprise) 🎵' },
      { time: 136, text: 'Ride the wave, neon horizon!' },
      { time: 144, text: 'Stars collide, a new sun is rising.' },
      { time: 152, text: '🎵 (Outro - Soft Analog Echoes) 🎵' },
      { time: 170, text: 'The grid goes quiet...' }
    ]
  },
  {
    id: 'lofi-rain',
    title: 'Lo-Fi Raindrops',
    artist: 'Coffee Mug Beats',
    album: 'Midnight Coffee',
    genre: 'Lofi Chill',
    year: 2023,
    duration: 150,
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop',
    audioUrl: 'synth:lofi',
    themeColor: '#8b5cf6', // Violet 500
    secondaryColor: '#f43f5e', // Rose 500
    rating: 4,
    playCount: 124,
    isSynthetic: true,
    lyrics: [
      { time: 0, text: '☔ (Soft Rain and Tape Hiss Intro) ☔' },
      { time: 6, text: 'Warm mug of tea, watching the rain outside...' },
      { time: 15, text: 'Everything slow, nowhere to run or hide.' },
      { time: 24, text: 'Vinyl crackles, heartbeat matches the sub.' },
      { time: 33, text: 'Lost in the rhythm, cozy study club.' },
      { time: 42, text: '🎵 (Piano Interlude - Soft Jazzy Chords) 🎵' },
      { time: 55, text: 'No deadlines tomorrow, just the quiet of night.' },
      { time: 65, text: 'In this cozy room, everything feels so right.' },
      { time: 75, text: 'Relax your shoulders, let your mind drift away.' },
      { time: 85, text: 'The worries of the world are for another day.' },
      { time: 95, text: '🎵 (Lofi Beat Drop - Vinyl Crackle) 🎵' },
      { time: 110, text: 'Just breathing... steady and slow.' },
      { time: 120, text: 'Letting the music take full control.' },
      { time: 130, text: '☔ (Rain fades into the background...) ☔' }
    ]
  },
  {
    id: 'ambient-dream',
    title: 'Echoes of Cosmos',
    artist: 'Nebula Wanderer',
    album: 'Deep Space Travel',
    genre: 'Ambient',
    year: 2025,
    duration: 210,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop',
    audioUrl: 'synth:ambient',
    themeColor: '#06b6d4', // Cyan 500
    secondaryColor: '#10b981', // Emerald 500
    rating: 5,
    playCount: 19,
    isSynthetic: true,
    lyrics: [
      { time: 0, text: '🌌 (Deep Cosmic Drone - Sub Ambient Vibrations) 🌌' },
      { time: 12, text: 'Floating in zero gravity...' },
      { time: 25, text: 'Looking down at the blue sphere.' },
      { time: 38, text: 'Quiet stars surround me.' },
      { time: 50, text: 'All the noise is gone.' },
      { time: 62, text: '🎵 (Celestial Synth Pad Sweeps) 🎵' },
      { time: 80, text: 'A beacon pulsing in the deep dark space.' },
      { time: 95, text: 'Connecting all of us across time and place.' },
      { time: 110, text: 'No boundaries, no borders, just infinite light.' },
      { time: 125, text: 'Shining through the longest galactic night.' },
      { time: 140, text: '🎵 (Ethereal Resonant Filters) 🎵' },
      { time: 165, text: 'Sinking deeper into the velvet void.' },
      { time: 180, text: 'Cosmic dust and starlight combined.' },
      { time: 195, text: '🌌 (Cosmos fades out into silence...) 🌌' }
    ]
  },
  {
    id: 'chillwave-sunset',
    title: 'Acoustic Gold',
    artist: 'Summer Drifters',
    album: 'Endless Horizons',
    genre: 'Acoustic Indie',
    year: 2024,
    duration: 165,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop',
    audioUrl: 'synth:acoustic',
    themeColor: '#f59e0b', // Amber 500
    secondaryColor: '#ef4444', // Red 500
    rating: 4,
    playCount: 65,
    isSynthetic: true,
    lyrics: [
      { time: 0, text: '🎸 (Bright Acoustic Guitar Strumming) 🎸' },
      { time: 8, text: 'Sand on our feet, the golden hour glow.' },
      { time: 16, text: 'Watching the tide as it comes and goes.' },
      { time: 24, text: 'No maps, no plans, just a road to the coast.' },
      { time: 32, text: 'These are the moments that I cherish most.' },
      { time: 40, text: '🎵 (Melodic Guitar & Bass Harmony) 🎵' },
      { time: 48, text: 'We are chasing the sun, under acoustic skies.' },
      { time: 56, text: 'Seeing the reflection of gold in your eyes.' },
      { time: 64, text: 'Sing along to the chord progressions we make,' },
      { time: 72, text: 'And forget every promise we had to break.' },
      { time: 80, text: '🎸 (Guitar Solo - Classic fingerpicking) 🎸' },
      { time: 96, text: 'Campfire sparks rising up to the night,' },
      { time: 104, text: 'Everything is warm, everything is light.' },
      { time: 112, text: 'Strumming our way into the cool midnight breeze,' },
      { time: 120, text: 'Living our lives with the absolute ease.' },
      { time: 128, text: '🎵 (Choral Harmonies) 🎵' },
      { time: 136, text: 'Under acoustic skies...' },
      { time: 144, text: 'Chasing the sun...' },
      { time: 152, text: '🎸 (Outro - Fading Guitar Chord) 🎸' }
    ]
  }
];

export const AUDIO_PRESETS = [
  { name: 'Flat', bass: 0, mid: 0, treble: 0 },
  { name: 'Bass Booster', bass: 8, mid: 1, treble: -2 },
  { name: 'Vocal Enhancer', bass: -2, mid: 6, treble: 3 },
  { name: 'Electronic', bass: 5, mid: -1, treble: 5 },
  { name: 'Acoustic/Indie', bass: 2, mid: 3, treble: 4 },
  { name: 'Lofi Cozy', bass: 6, mid: 2, treble: -4 }
];
