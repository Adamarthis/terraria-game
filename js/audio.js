export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicPlaying = false;
    this.musicGain = null;
    this.musicOsc = null;
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playMineSound() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) { /* ignore */ }
  }

  playHitSound() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) { /* ignore */ }
  }

  playPickupSound() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) { /* ignore */ }
  }

  playBossRoar() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.5);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.6);
    } catch (e) { /* ignore */ }
  }

  playCraftSound() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) { /* ignore */ }
  }

  startMusic() {
    if (!this.enabled || !this.ctx || this.musicPlaying) return;
    // Simple background ambient drone
    this.musicPlaying = true;
    try {
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);

      this.musicOsc = this.ctx.createOscillator();
      this.musicOsc.type = 'sine';
      this.musicOsc.frequency.setValueAtTime(80, this.ctx.currentTime);
      this.musicOsc.connect(this.musicGain);
      this.musicOsc.start();
    } catch (e) { /* ignore */ }
  }

  stopMusic() {
    if (this.musicOsc) {
      try { this.musicOsc.stop(); } catch (e) { /* ignore */ }
      this.musicOsc = null;
    }
    this.musicPlaying = false;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopMusic();
    }
  }
}