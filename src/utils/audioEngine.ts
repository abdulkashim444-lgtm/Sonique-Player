/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AUDIO_PRESETS } from '../data/songs';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private audioSource: MediaElementAudioSourceNode | null = null;

  // Web Audio Nodes
  private analyser: AnalyserNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private mainGain: GainNode | null = null;
  private synthGain: GainNode | null = null;

  // Synthesizer State
  private synthIntervalId: any = null;
  private synthBeatStep = 0;
  private isSynthPlaying = false;
  private currentSynthPreset = 'neon';

  // Callbacks
  public onTimeUpdate: (currentTime: number) => void = () => {};
  public onEnded: () => void = () => {};

  // Track state
  private playbackIntervalId: any = null;
  private currentDuration = 180; // default
  private currentTrackTime = 0;

  constructor() {
    // Lazy initialize to bypass browser autoplay policies
  }

  private init() {
    if (this.ctx) return;

    // Create AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Create Audio Element
    this.audioEl = new Audio();
    this.audioEl.crossOrigin = 'anonymous';

    // Hook HTML5 Audio events
    this.audioEl.addEventListener('timeupdate', () => {
      if (!this.isSynthPlaying && this.audioEl) {
        this.currentTrackTime = this.audioEl.currentTime;
        this.onTimeUpdate(this.audioEl.currentTime);
      }
    });

    this.audioEl.addEventListener('ended', () => {
      if (!this.isSynthPlaying) {
        this.onEnded();
      }
    });

    // Create Analyzer
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;

    // Create Equalizer filters
    this.bassFilter = this.ctx.createBiquadFilter();
    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.value = 200; // 200Hz below for Bass

    this.midFilter = this.ctx.createBiquadFilter();
    this.midFilter.type = 'peaking';
    this.midFilter.frequency.value = 1000; // 1kHz for mids
    this.midFilter.Q.value = 1.0;

    this.trebleFilter = this.ctx.createBiquadFilter();
    this.trebleFilter.type = 'highshelf';
    this.trebleFilter.frequency.value = 4000; // 4kHz above for Treble

    // Create Gains
    this.mainGain = this.ctx.createGain();
    this.mainGain.gain.value = 0.8;

    this.synthGain = this.ctx.createGain();
    this.synthGain.gain.value = 0.5;

    // Connect Audio Element source
    this.audioSource = this.ctx.createMediaElementSource(this.audioEl);
    
    // Connect audio element source through EQ -> Analyser -> Main Gain -> Destination
    this.audioSource.connect(this.bassFilter);
    this.bassFilter.connect(this.midFilter);
    this.midFilter.connect(this.trebleFilter);
    this.trebleFilter.connect(this.analyser);
    this.analyser.connect(this.mainGain);
    this.mainGain.connect(this.ctx.destination);

    // Connect Synthesizer gain to analyzer as well
    this.synthGain.connect(this.bassFilter); // Route synth through EQ filters too!
  }

  private ensureAudioContextRunning() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(url: string, duration: number = 180) {
    this.ensureAudioContextRunning();
    this.stopCurrent();

    this.currentDuration = duration;
    this.currentTrackTime = 0;

    if (url.startsWith('synth:')) {
      const presetName = url.split(':')[1];
      this.playSynth(presetName);
    } else {
      if (this.audioEl) {
        this.audioEl.src = url;
        this.audioEl.play().catch(err => {
          console.warn('Playback error, browser blocked or bad source:', err);
        });
      }
    }
  }

  public pause() {
    if (this.isSynthPlaying) {
      this.isSynthPlaying = false;
      this.stopSynthInterval();
    } else {
      this.audioEl?.pause();
    }
    this.stopPlaybackInterval();
  }

  public resume() {
    this.ensureAudioContextRunning();
    if (this.currentSynthPreset && this.currentSynthPreset !== '') {
      // It is a synth track
      this.playSynth(this.currentSynthPreset, true);
    } else {
      this.audioEl?.play().catch(e => console.warn(e));
    }
    this.startPlaybackTimer();
  }

  public stop() {
    this.stopCurrent();
    this.onTimeUpdate(0);
  }

  private stopCurrent() {
    this.audioEl?.pause();
    if (this.audioEl) this.audioEl.src = '';
    this.isSynthPlaying = false;
    this.stopSynthInterval();
    this.stopPlaybackInterval();
  }

  public seek(seconds: number) {
    this.ensureAudioContextRunning();
    if (this.isSynthPlaying) {
      this.currentTrackTime = Math.max(0, Math.min(this.currentDuration, seconds));
      this.onTimeUpdate(this.currentTrackTime);
    } else if (this.audioEl) {
      this.audioEl.currentTime = seconds;
      this.currentTrackTime = seconds;
    }
  }

  public setVolume(volume: number) {
    this.ensureAudioContextRunning();
    if (this.mainGain) {
      // Smooth volume transition to avoid clicks
      this.mainGain.gain.setTargetAtTime(volume, this.ctx!.currentTime, 0.05);
    }
  }

  public setPlaybackRate(rate: number) {
    if (this.audioEl) {
      this.audioEl.playbackRate = rate;
    }
  }

  public applyEqualizer(bass: number, mid: number, treble: number) {
    this.ensureAudioContextRunning();
    if (this.bassFilter && this.midFilter && this.trebleFilter) {
      const now = this.ctx!.currentTime;
      this.bassFilter.gain.setTargetAtTime(bass, now, 0.1);
      this.midFilter.gain.setTargetAtTime(mid, now, 0.1);
      this.trebleFilter.gain.setTargetAtTime(treble, now, 0.1);
    }
  }

  public applyPreset(presetName: string) {
    const preset = AUDIO_PRESETS.find(p => p.name === presetName) || AUDIO_PRESETS[0];
    this.applyEqualizer(preset.bass, preset.mid, preset.treble);
  }

  public getAnalyserData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(128);
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public getAnalyserWaveformData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(128);
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  // --- Procedural Synth Engine ---
  private playSynth(preset: string, isResume = false) {
    this.isSynthPlaying = true;
    this.currentSynthPreset = preset;
    
    if (!isResume) {
      this.currentTrackTime = 0;
      this.synthBeatStep = 0;
    }

    this.startSynthInterval();
    this.startPlaybackTimer();
  }

  private startSynthInterval() {
    this.stopSynthInterval();

    const bpm = this.currentSynthPreset === 'neon' ? 120 :
                this.currentSynthPreset === 'lofi' ? 80 :
                this.currentSynthPreset === 'ambient' ? 60 : 90; // acoustic/ambient bpm

    const stepDuration = 60 / bpm / 2; // eighth notes

    let nextStepTime = this.ctx!.currentTime;

    const scheduleNextSteps = () => {
      while (nextStepTime < this.ctx!.currentTime + 0.1) {
        if (!this.isSynthPlaying) break;
        this.scheduleSynthStep(this.synthBeatStep, nextStepTime);
        this.synthBeatStep = (this.synthBeatStep + 1) % 16;
        nextStepTime += stepDuration;
      }
    };

    scheduleNextSteps();
    this.synthIntervalId = setInterval(scheduleNextSteps, 50);
  }

  private stopSynthInterval() {
    if (this.synthIntervalId) {
      clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
  }

  private startPlaybackTimer() {
    this.stopPlaybackInterval();
    this.playbackIntervalId = setInterval(() => {
      this.currentTrackTime += 0.25;
      if (this.currentTrackTime >= this.currentDuration) {
        this.stopCurrent();
        this.onEnded();
      } else {
        this.onTimeUpdate(this.currentTrackTime);
      }
    }, 250);
  }

  private stopPlaybackInterval() {
    if (this.playbackIntervalId) {
      clearInterval(this.playbackIntervalId);
      this.playbackIntervalId = null;
    }
  }

  private scheduleSynthStep(step: number, time: number) {
    if (!this.ctx || !this.synthGain) return;

    const preset = this.currentSynthPreset;

    // Dynamic notes depending on scale
    // scale: A minor pentatonic (A, C, D, E, G)
    const scale = [110, 130.81, 146.83, 164.81, 196.00, 220, 261.63, 293.66, 329.63, 392.00, 440];

    // Beats Scheduling
    if (preset === 'neon') {
      // Four-on-the-floor beat with energetic synthwave bass
      // 1. Kick on 0, 4, 8, 12
      if (step % 4 === 0) {
        this.triggerSynthKick(time);
      }
      // 2. Snare on 4, 12
      if (step === 4 || step === 12) {
        this.triggerSynthSnare(time);
      }
      // 3. Hihat on odd steps
      if (step % 2 === 1) {
        this.triggerSynthHihat(time);
      }
      // 4. Heavy running bassline
      const bassNotes = [55, 55, 65.4, 65.4, 73.4, 73.4, 82.4, 82.4]; // A1, C2, D2, E2
      const bassNote = bassNotes[Math.floor(step / 2) % bassNotes.length];
      this.triggerBassSynth(bassNote, time, 0.15, 'sawtooth');

      // 5. Arpeggiated Lead
      if (step % 2 === 0) {
        const leadPattern = [5, 7, 8, 10, 8, 7, 5, 4, 5, 8, 7, 10, 9, 7, 8, 10];
        const noteIndex = leadPattern[step];
        this.triggerLeadSynth(scale[noteIndex], time, 0.12, 'sawtooth');
      }
    } 
    else if (preset === 'lofi') {
      // Relaxed dusty boom-bap lofi beat
      // Kick on 0, 10
      if (step === 0 || step === 10) {
        this.triggerSynthKick(time);
      }
      // Snare on 4, 12
      if (step === 4 || step === 12) {
        this.triggerSynthSnare(time, 0.3); // softer snare
      }
      // Relaxed jazzy Rhodes chords on step 0, 8
      if (step === 0) {
        // Am7 (A - C - E - G)
        this.triggerPadChord([110, 130.81, 164.81, 196.00], time, 1.8, 'triangle');
      } else if (step === 8) {
        // Cmaj7 (C - E - G - B)
        this.triggerPadChord([130.81, 164.81, 196.00, 246.94], time, 1.8, 'triangle');
      }

      // Mellow piano/guitar pluck melody
      if (step === 3 || step === 7 || step === 11 || step === 14) {
        const melodyPattern = [6, 8, 9, 7];
        const pluckNote = scale[melodyPattern[step % 4]];
        this.triggerLeadSynth(pluckNote, time, 0.4, 'sine', 0.15);
      }
    } 
    else if (preset === 'ambient') {
      // Generative space ambient - slow drifting tones and echoes, almost no drums
      if (step === 0) {
        // Extremely long deep pad chord (A minor 9)
        this.triggerPadChord([55, 110, 164.81, 261.63, 329.63, 392.00, 493.88], time, 6.0, 'sine', 0.25);
      }
      
      // Random shimmering starlight bell sounds
      if (Math.random() < 0.25) {
        const highScale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        const bellNote = highScale[Math.floor(Math.random() * highScale.length)];
        this.triggerBell(bellNote, time, 1.5, 0.08);
      }
    } 
    else {
      // Acoustic sunset - warm string-like synthesis
      // Soft kick and brush-like percussion
      if (step === 0 || step === 8) {
        this.triggerSynthKick(time, 40);
      }
      if (step === 4 || step === 12) {
        this.triggerSynthHihat(time, 0.08);
      }

      // Strummed chords
      if (step === 0) {
        this.triggerArpeggiatedStrum([110, 164.81, 220, 261.63, 329.63], time, 'sine');
      } else if (step === 8) {
        this.triggerArpeggiatedStrum([98, 146.83, 196.00, 246.94, 293.66], time, 'sine');
      }

      // Sweet wooden flute melody
      if (step === 2 || step === 6 || step === 10 || step === 13) {
        const flutePattern = [5, 4, 6, 7];
        this.triggerLeadSynth(scale[flutePattern[step % 4]] * 1.5, time, 0.6, 'sine', 0.12, 0.08);
      }
    }
  }

  // Synthesizer Drum Components
  private triggerSynthKick(time: number, customPitch = 120) {
    if (!this.ctx || !this.synthGain) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.synthGain);

    osc.frequency.setValueAtTime(customPitch, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.3);

    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  private triggerSynthSnare(time: number, maxVolume = 0.5) {
    if (!this.ctx || !this.synthGain) return;

    // White noise generator for snare snap
    const bufferSize = this.ctx.sampleRate * 0.2; // 0.2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.synthGain);

    noiseGain.gain.setValueAtTime(maxVolume, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    // Add a quick pitch decay oscillator for the body of the snare
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.connect(oscGain);
    oscGain.connect(this.synthGain);

    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);
    
    oscGain.gain.setValueAtTime(maxVolume * 0.7, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    noise.start(time);
    noise.stop(time + 0.2);
    
    osc.start(time);
    osc.stop(time + 0.1);
  }

  private triggerSynthHihat(time: number, volume = 0.15) {
    if (!this.ctx || !this.synthGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(10000, time);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.synthGain);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.start(time);
    osc.stop(time + 0.06);
  }

  // Synthesizer Melodic Components
  private triggerBassSynth(freq: number, time: number, duration: number, type: OscillatorType = 'sawtooth') {
    if (!this.ctx || !this.synthGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, time);
    filter.frequency.exponentialRampToValueAtTime(80, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.synthGain);

    gain.gain.setValueAtTime(0.0, time);
    gain.gain.linearRampToValueAtTime(0.4, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.start(time);
    osc.stop(time + duration);
  }

  private triggerLeadSynth(
    freq: number, 
    time: number, 
    duration: number, 
    type: OscillatorType = 'triangle',
    maxVol = 0.25,
    attackTime = 0.02
  ) {
    if (!this.ctx || !this.synthGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, time);
    filter.frequency.exponentialRampToValueAtTime(800, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.synthGain);

    // Warm Attack Decay Envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(maxVol, time + attackTime);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.start(time);
    osc.stop(time + duration);
  }

  private triggerPadChord(
    freqs: number[], 
    time: number, 
    duration: number, 
    type: OscillatorType = 'sine',
    maxVol = 0.22
  ) {
    if (!this.ctx || !this.synthGain) return;

    freqs.forEach(freq => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, time);
      filter.frequency.linearRampToValueAtTime(400, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.synthGain!);

      // Drifting pad attack
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(maxVol / freqs.length, time + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  private triggerBell(freq: number, time: number, duration: number, maxVol = 0.1) {
    if (!this.ctx || !this.synthGain) return;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator(); // frequency modulation
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // FM Bell frequency (usually a non-harmonic multiplier like 1.4 or 2.7)
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 1.414, time);

    const fmGain = this.ctx.createGain();
    fmGain.gain.setValueAtTime(500, time);
    fmGain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc2.connect(fmGain);
    fmGain.connect(osc.frequency);

    osc.connect(gain);
    gain.connect(this.synthGain);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(maxVol, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.start(time);
    osc2.start(time);

    osc.stop(time + duration);
    osc2.stop(time + duration);
  }

  private triggerArpeggiatedStrum(freqs: number[], time: number, type: OscillatorType = 'sine') {
    freqs.forEach((freq, idx) => {
      // Strum delay: 0.03s between each string
      const stringTime = time + (idx * 0.03);
      this.triggerLeadSynth(freq, stringTime, 1.2, type, 0.12, 0.05);
    });
  }
}

// Global Singleton Audio Engine
export const activeAudioEngine = new AudioEngine();
