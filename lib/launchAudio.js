/**
 * High-performance Web Audio API synthesizer for launch sound effects.
 * Requires 0 external audio files, works completely offline, zero 404 or CORS risk.
 */

class LaunchSoundSynthesizer {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Sci-fi button click / ignite pulse
  playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }

  // Triumphant orchestral fanfare chord on launch ignition!
  playLaunchFanfare() {
    try {
      this.init();
      if (!this.ctx) return;

      const notes = [
        { f: 523.25, time: 0.0, dur: 0.4 }, // C5
        { f: 659.25, time: 0.2, dur: 0.4 }, // E5
        { f: 783.99, time: 0.4, dur: 0.5 }, // G5
        { f: 1046.5, time: 0.6, dur: 1.2 }, // C6
        { f: 1318.51, time: 0.8, dur: 1.5 }, // E6
      ];

      notes.forEach(({ f, time, dur }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + time);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime + time);
        gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + time + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + time);
        osc.stop(this.ctx.currentTime + time + dur);
      });
    } catch (e) {
      console.warn("Audio fanfare error:", e);
    }
  }
}

export const launchAudio = new LaunchSoundSynthesizer();
