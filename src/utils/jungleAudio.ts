/**
 * Procedural Web Audio API Sound Synthesizer for 3D Jungle Runner
 * 100% code-generated sound effects & ambient tribal rhythm
 * Zero external audio files or network dependencies
 */

class JungleAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private drumTimer: number | null = null;
  private drumStep: number = 0;
  private isDrumRunning: boolean = false;
  private coinPitchIndex: number = 0;
  private lastCoinTime: number = 0;

  constructor() {
    // Check localStorage for mute preference
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('jungle_runner_mute');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('jungle_runner_mute', String(this.isMuted));
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
    if (this.isMuted && this.isDrumRunning) {
      this.stopDrums();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(val: boolean) {
    this.isMuted = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('jungle_runner_mute', String(this.isMuted));
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  /**
   * Coin collection chime: increases in pitch if collected quickly in combo
   */
  public playCoin() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      // Pentatonic pitch escalation for consecutive coins
      const nowMs = performance.now();
      if (nowMs - this.lastCoinTime < 800) {
        this.coinPitchIndex = (this.coinPitchIndex + 1) % 6;
      } else {
        this.coinPitchIndex = 0;
      }
      this.lastCoinTime = nowMs;

      const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // C5 to C6
      const freq = pentatonic[this.coinPitchIndex];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.15);

      // Shimmer overtone
      const overtone = this.ctx.createOscillator();
      const overGain = this.ctx.createGain();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2, now);
      overGain.gain.setValueAtTime(0.1, now);
      overGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      overtone.connect(overGain);
      overGain.connect(this.masterGain);
      overtone.start(now);
      overtone.stop(now + 0.11);
    } catch {
      // AudioContext policy
    }
  }

  /**
   * Jump swoosh
   */
  public playJump() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.18);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  /**
   * Slide whoosh
   */
  public playSlide() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      // Filtered noise swoosh for ground friction slide
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.18);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(350, now + 0.18);
      filter.Q.value = 2.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.19);
    } catch {}
  }

  /**
   * Lane dash whoosh
   */
  public playLaneSwitch(dir: number) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(dir > 0 ? 320 : 260, now);
      osc.frequency.exponentialRampToValueAtTime(dir > 0 ? 460 : 380, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  /**
   * Power-up pickup fanfare
   */
  public playPowerUp() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5

      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.32);
      });
    } catch {}
  }

  /**
   * Shield absorb sound
   */
  public playShieldBreak() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {}
  }

  /**
   * Collision impact & Game Over sound
   */
  public playCrash() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      // Heavy low thud
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);
      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.36);

      // Noise crunch
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 0.25);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.26);
    } catch {}
  }

  /**
   * UI Click
   */
  public playClick() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  /**
   * Start procedural tribal rhythm drum loop
   */
  public startDrums() {
    if (this.isDrumRunning) return;
    this.isDrumRunning = true;
    this.drumStep = 0;
    this.scheduleDrumTick();
  }

  public stopDrums() {
    this.isDrumRunning = false;
    if (this.drumTimer !== null) {
      window.clearTimeout(this.drumTimer);
      this.drumTimer = null;
    }
  }

  private scheduleDrumTick() {
    if (!this.isDrumRunning) return;
    const bpm = 124;
    const stepDuration = (60 / bpm) / 4; // 16th notes

    if (!this.isMuted) {
      this.playDrumStep(this.drumStep);
    }

    this.drumStep = (this.drumStep + 1) % 16;
    this.drumTimer = window.setTimeout(() => {
      this.scheduleDrumTick();
    }, stepDuration * 1000);
  }

  private playDrumStep(step: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;

      // Kick drum on 0, 8
      if (step === 0 || step === 8) {
        const kick = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(110, now);
        kick.frequency.exponentialRampToValueAtTime(45, now + 0.09);
        kickGain.gain.setValueAtTime(0.18, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        kick.connect(kickGain);
        kickGain.connect(this.masterGain);
        kick.start(now);
        kick.stop(now + 0.11);
      }

      // Jungle bongo / high tom on 4, 10, 14
      if (step === 4 || step === 10 || step === 14) {
        const bongo = this.ctx.createOscillator();
        const bongoGain = this.ctx.createGain();
        bongo.type = 'triangle';
        const pitch = step === 4 ? 220 : step === 10 ? 280 : 330;
        bongo.frequency.setValueAtTime(pitch, now);
        bongo.frequency.exponentialRampToValueAtTime(pitch * 0.7, now + 0.07);
        bongoGain.gain.setValueAtTime(0.12, now);
        bongoGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        bongo.connect(bongoGain);
        bongoGain.connect(this.masterGain);
        bongo.start(now);
        bongo.stop(now + 0.09);
      }

      // Shaker on every odd 16th note
      if (step % 2 === 1) {
        const count = 400;
        const buffer = this.ctx.createBuffer(1, count, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < count; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.04;
        }
        const shaker = this.ctx.createBufferSource();
        shaker.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 5000;
        shaker.connect(filter);
        filter.connect(this.masterGain);
        shaker.start(now);
      }
    } catch {}
  }
}

export const jungleAudio = new JungleAudioEngine();
