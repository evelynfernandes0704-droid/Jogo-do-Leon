/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private currentStep: number = 0;

  constructor() {
    // Initialized on first interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.gain.value = this.isMusicMuted ? 0 : 0.14;
      this.sfxGain.gain.value = this.isMuted ? 0 : 0.25;

      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public resumeContext() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundMute(muted: boolean) {
    this.isMuted = muted;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(muted ? 0 : 0.25, this.ctx.currentTime);
    }
  }

  public setMusicMute(muted: boolean) {
    this.isMusicMuted = muted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(muted ? 0 : 0.14, this.ctx.currentTime);
    }
    if (!muted) {
      this.startMusic();
    }
  }

  public getSoundMuted(): boolean {
    return this.isMuted;
  }

  public getMusicMuted(): boolean {
    return this.isMusicMuted;
  }

  // --- Sound Effects ---

  public playJump() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.15);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playShootWeb() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playSwingWeb() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    // Anchor hook sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(650, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.21);
  }

  public playStomp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playPunch() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playWebTrap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    // Sticky web entrapment sound
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.18);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  public playSymbioteTransform() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.22);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.45);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.48);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.49);
  }

  public playSymbioteTendril() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.2);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  public playCoin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc1.type = 'square';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(987.77, t); // B5
    osc1.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    osc2.frequency.setValueAtTime(987.77 * 0.5, t);
    osc2.frequency.setValueAtTime(1318.51 * 0.5, t + 0.08);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.36);
    osc2.stop(t + 0.36);
  }

  public playPizza() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    // Mario power-up style chime
    const notes = [330, 392, 659, 523, 587, 784];
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.09);
    });
  }

  public playPowerup() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    // Ascending 8-bit scale fanfare
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + idx * 0.05;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.08);
    });
  }

  public playSpiderSense() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    [0, 0.09].forEach((delay) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + delay;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, st);
      osc.frequency.exponentialRampToValueAtTime(1200, st + 0.06);

      gain.gain.setValueAtTime(0.15, st);
      gain.gain.exponentialRampToValueAtTime(0.01, st + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(st);
      osc.stop(st + 0.08);
    });
  }

  public playHurt() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.2);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  public playBossHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.25);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  public playLevelClear() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    // Victory fanfare!
    const melody = [
      { f: 523, d: 0.12 }, // C5
      { f: 659, d: 0.12 }, // E5
      { f: 784, d: 0.12 }, // G5
      { f: 1046, d: 0.25 }, // C6
      { f: 880, d: 0.15 }, // A5
      { f: 1046, d: 0.4 }, // C6
    ];

    let t = this.ctx.currentTime;
    melody.forEach((note) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + note.d + 0.02);

      t += note.d + 0.04;
    });
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [440, 415, 392, 330];
    let t = this.ctx.currentTime;

    notes.forEach((freq) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.24);

      t += 0.24;
    });
  }

  // --- Retro Chiptune Background Music ---

  public startMusic() {
    this.initContext();
    this.resumeContext();

    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }

    this.isMusicPlaying = true;
    this.currentStep = 0;

    if (this.musicGain && this.ctx) {
      try {
        this.musicGain.gain.setValueAtTime(this.isMusicMuted ? 0 : 0.14, this.ctx.currentTime);
      } catch {
        // Safe fallback
      }
    }

    // Iconic 8-bit Spider-Man theme adapted into retro arcade rhythm
    // Lead melody notes in Hz
    const melodyPattern = [
      // "Spider-Man, Spider-Man..."
      261.63, 0, 311.13, 0, 349.23, 0, 392.00, 349.23,
      311.13, 0, 261.63, 0, 233.08, 0, 261.63, 0,
      // "Does whatever a spider can..."
      349.23, 0, 392.00, 0, 466.16, 0, 523.25, 466.16,
      392.00, 0, 349.23, 0, 311.13, 349.23, 392.00, 0,
      // "Spins a web, any size..."
      523.25, 0, 466.16, 0, 392.00, 0, 349.23, 0,
      311.13, 0, 349.23, 392.00, 261.63, 0, 261.63, 0,
      // "Catches thieves just like flies!"
      233.08, 0, 261.63, 0, 311.13, 0, 349.23, 0,
      392.00, 349.23, 311.13, 261.63, 261.63, 0, 0, 0,
    ];

    // Driving arcade bassline
    const bassPattern = [
      130.81, 130.81, 155.56, 155.56, 174.61, 174.61, 196.00, 196.00,
      155.56, 155.56, 130.81, 130.81, 116.54, 116.54, 130.81, 130.81,
      174.61, 174.61, 196.00, 196.00, 233.08, 233.08, 261.63, 261.63,
      196.00, 196.00, 174.61, 174.61, 155.56, 155.56, 196.00, 196.00,
      261.63, 261.63, 233.08, 233.08, 196.00, 196.00, 174.61, 174.61,
      155.56, 155.56, 174.61, 174.61, 130.81, 130.81, 130.81, 130.81,
      116.54, 116.54, 130.81, 130.81, 155.56, 155.56, 174.61, 174.61,
      196.00, 196.00, 155.56, 155.56, 130.81, 130.81, 130.81, 0,
    ];

    const stepDurationMs = 135; // ~111 BPM classic NES tempo

    this.musicInterval = window.setInterval(() => {
      if (!this.isMusicPlaying || this.isMusicMuted) {
        return;
      }

      if (!this.ctx || !this.musicGain) {
        this.initContext();
        return;
      }

      // DO NOT pile up oscillators if the context is still suspended (waiting for user gesture)!
      if (this.ctx.state !== 'running') {
        this.ctx.resume().catch(() => {});
        return;
      }

      try {
        const t = this.ctx.currentTime + 0.02; // Small 20ms lookahead for rock-solid timing
        const melodyFreq = melodyPattern[this.currentStep];
        const bassFreq = bassPattern[this.currentStep];

        // 1. Play lead square note
        if (melodyFreq > 0) {
          const lead = this.ctx.createOscillator();
          const leadGain = this.ctx.createGain();

          lead.type = 'square';
          lead.frequency.setValueAtTime(melodyFreq, t);

          leadGain.gain.setValueAtTime(0.09, t);
          leadGain.gain.linearRampToValueAtTime(0.01, t + 0.11);

          lead.connect(leadGain);
          leadGain.connect(this.musicGain);

          lead.start(t);
          lead.stop(t + 0.12);
        }

        // 2. Play bass triangle note
        if (bassFreq > 0) {
          const bass = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();

          bass.type = 'triangle';
          bass.frequency.setValueAtTime(bassFreq, t);

          bassGain.gain.setValueAtTime(0.12, t);
          bassGain.gain.linearRampToValueAtTime(0.02, t + 0.12);

          bass.connect(bassGain);
          bassGain.connect(this.musicGain);

          bass.start(t);
          bass.stop(t + 0.13);
        }

        // 3. Retro 8-bit Noise Drum (Hi-Hat / Snare tap on off-beats)
        if (this.currentStep % 2 === 1) {
          const bufferSize = this.ctx.sampleRate * 0.03;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.15;
          }

          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;
          const noiseGain = this.ctx.createGain();
          noiseGain.gain.setValueAtTime(0.04, t);
          noiseGain.gain.linearRampToValueAtTime(0.001, t + 0.03);

          noise.connect(noiseGain);
          noiseGain.connect(this.musicGain);

          noise.start(t);
          noise.stop(t + 0.035);
        }
      } catch {
        // Ignore frame error and continue
      }

      this.currentStep = (this.currentStep + 1) % melodyPattern.length;
    }, stepDurationMs);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sound = new SoundSystem();

// Global gesture listeners to unlock Web Audio on first click/key/tap
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    sound.resumeContext();
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
}

