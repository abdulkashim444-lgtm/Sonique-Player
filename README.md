# Sonique Player 🎵
A premium, production-ready, acoustic visual music player. Sonique is designed to rival premium music platforms (Spotify, Apple Music, and YouTube Music) featuring real-time audio loop synthesis, responsive canvas visualizers, scrolling interactive lyrics, and dynamic color theme generation.

## 🛠 Tech Stack
- **React 19 & TypeScript**: Component lifecycle orchestration and type-safe data pipelines.
- **Tailwind CSS v4**: Glassmorphic backdrops, premium gradients, neon glows, and responsive typography layouts.
- **HTML5 Audio API**: Stream actual music tracks seamlessly.
- **Web Audio API**: Advanced real-time synthesizer with 3-band equalizers and dynamic scheduling algorithms.
- **Canvas API**: Render real-time high-performance frequencies, waveforms, circular rings, and sub-bass pulse animations.
- **Web Speech API**: In-browser local voice recognition supporting speech controls like play, pause, next, back, and mute.
- **LocalStorage**: Persistent cache mechanism backing active favorites, customized playlists, sleep settings, listening counts, and playback volume.

---

## 🚀 Key Features

### 1. High-Fidelity Audio Synth Engine
In addition to standard audio streaming compatibility, Sonique includes a custom **procedural step sequencer** and **harmonic synthesizer** which synthesizes audio directly in the client browser:
- **Neon Horizon (Synthwave)**: Features four-on-the-floor kick, snap snare, hi-hat step sequencing, and running basslines paired with high arpeggiated lead notes.
- **Lo-Fi Raindrops (Chill)**: Warm chords, soft raindrops, crackling vinyl noise generators, and cozy piano plucks.
- **Echoes of Cosmos (Ambient)**: Generative deep space chord pads with long decay frequencies and shimmering star bell modulators.
- **Acoustic Gold (Sunset Indie)**: Fingerpicked acoustic guitar-like string pluck modulators and wooden flute melodies.

### 2. Apple Music-style Synchronized Lyrics
- Automatically tracks playback progression down to millisecond accuracy.
- Smoothly scrolls and centers the active lyrics with clean ambient fade effects on the top and bottom borders.
- **Interactive Karaoke Seeking**: Click any lyric line to instantly seek the playback progress to that exact timestamp!

### 3. High-Performance Canvas Visualizers
Four visual styles rendered on high-DPI screens at 60 FPS:
- **Frequency Bars**: Digital equalizer bounce bars with ambient neon glow.
- **Waveform**: Fluid oscilloscope line showing actual time-domain cycles.
- **Circular Spectrum**: Radiant ring expanding and pulsing with active sub-bass.
- **Pulse**: Multi-layered glowing neon orbits scaling directly with music energy.

### 4. Dynamic Theme Generation
- Select `Dynamic Theme` to automatically extract the primary branding and secondary glowing colors from the active song cover and apply them to buttons, backdrops, and indicators!

### 5. Smart AI Playlist Suggestions
- Evaluates the current active track metadata and user-selected AI moods (Chill, Energetic, Cyberpunk, Melancholy) to generate smart track recommenders, complete with mock AI analysis logs.

---

## ⌨️ Keyboard Shortcuts
- `Space` ➔ Play / Pause
- `← (Left Arrow)` ➔ Previous Song
- `→ (Right Arrow)` ➔ Next Song
- `↑ (Up Arrow)` ➔ Volume Up (+5%)
- `↓ (Down Arrow)` ➔ Volume Down (-5%)
- `M` ➔ Mute / Unmute
- `S` ➔ Toggle Shuffle
- `R` ➔ Toggle Repeat Mode
- `F` ➔ Toggle Favorite / Liked
- `L` ➔ Toggle Lyrics Panel

---

## 📁 Directory Architecture
```bash
src/
├── components/
│   ├── AISuggestions.tsx         # Algorithmic AI recommendations
│   ├── Header.tsx                # Branding, voice, shortcuts & full-screen indicators
│   ├── KeyboardShortcutsHelp.tsx # Hotkey instruction guide
│   ├── LyricsPanel.tsx           # Scrolling interactive Apple lyrics
│   ├── MainPlayer.tsx            # Main vinyl turntable and progression controls
│   ├── SettingsPanel.tsx         # Cache managers, animation rates & default volumes
│   ├── Sidebar.tsx               # Bento-style user stats and playlist customizers
│   ├── Toast.tsx                 # Absolute non-blocking status notifications
│   └── Visualizer.tsx            # Canvas API visual loops
├── data/
│   └── songs.ts                  # Music dataset with timestamps and synced lines
├── utils/
│   └── audioEngine.ts            # Web Audio API & Synth step scheduler
├── types.ts                      # Shared TypeScript model definitions
├── App.tsx                       # Global state orchestrator hub
└── index.css                     # Font variables and particle frames
```
