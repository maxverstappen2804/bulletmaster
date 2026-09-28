/**
 * BULLET MASTER // Web Audio Synthesized Engine Sound System
 * Zero-asset, pure Web Audio API synthesizer for realistic tachometer revs & limiter
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.osc1 = null;
    this.osc2 = null;
    this.subOsc = null;
    this.gainNode = null;
    this.filterNode = null;
    this.noiseNode = null;
    this.isRevving = false;
    this.currentRPM = 0;
    this.limiterTimer = null;

    // Load sound preference
    const saved = localStorage.getItem('bullet_audio_enabled');
    if (saved !== null) {
      this.enabled = saved === 'true';
    }
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch (e) {
      console.warn('Web Audio not supported', e);
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('bullet_audio_enabled', this.enabled);
    if (!this.enabled && this.isRevving) {
      this.stopRev();
    }
    return this.enabled;
  }

  playRev(targetRPM, duration = 1.2) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const oscSub = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      oscSub.type = 'triangle';

      // Map RPM (0 - 10000) to engine pitch
      const startPitch = 45 + (this.currentRPM / 10000) * 120;
      const targetPitch = 55 + (targetRPM / 10000) * 260;

      osc.frequency.setValueAtTime(startPitch, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, targetPitch), now + duration * 0.7);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, targetPitch * 0.8), now + duration);

      oscSub.frequency.setValueAtTime(startPitch * 0.5, now);
      oscSub.frequency.exponentialRampToValueAtTime(Math.max(10, targetPitch * 0.5), now + duration * 0.7);

      // Low pass filter sweeps with RPM
      filter.type = 'lowpass';
      filter.Q.value = 4.0;
      const startFilter = 400 + (this.currentRPM / 10000) * 1500;
      const targetFilter = 600 + (targetRPM / 10000) * 3200;
      filter.frequency.setValueAtTime(startFilter, now);
      filter.frequency.exponentialRampToValueAtTime(targetFilter, now + duration * 0.6);
      filter.frequency.exponentialRampToValueAtTime(800, now + duration);

      // Gain envelope
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
      gain.gain.setValueAtTime(0.25, now + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Limiter stutter if high RPM
      if (targetRPM > 8500) {
        for (let t = now + 0.35; t < now + duration * 0.75; t += 0.08) {
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.setValueAtTime(0.28, t + 0.04);
        }
      }

      osc.connect(filter);
      oscSub.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      oscSub.start(now);
      osc.stop(now + duration);
      oscSub.stop(now + duration);

      this.currentRPM = targetRPM;
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.15, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.16);
      });
    } catch (e) {}
  }

  playDenied() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [220, 185].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.18, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.16);
      });
    } catch (e) {}
  }

  stopRev() {
    // Graceful stop
  }
}

window.soundEngine = new SoundEngine();
