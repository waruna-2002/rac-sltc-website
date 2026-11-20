/**
 * Professional Studio Audio Engine for Rotaract SLTC Launch Ceremonies.
 * Uses pre-decoded 44.1kHz 16-bit PCM stereo audio buffers with Web Audio API.
 * 0ms latency, movie-trailer grade sub-bass impacts, and majestic orchestral fanfare.
 */

class ProfessionalLaunchSoundEngine {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.isPreloaded = false;
    this.soundUrls = {
      boom: "/sounds/countdown_boom.wav",
      fanfare: "/sounds/reveal_fanfare.wav",
    };
  }

  init() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  // Pre-load all sound files into RAM so playback is 100% instantaneous on stage
  async preload() {
    if (typeof window === "undefined" || this.isPreloaded) return;
    this.init();

    try {
      const promises = Object.entries(this.soundUrls).map(async ([key, url]) => {
        try {
          const res = await fetch(url);
          const arrayBuffer = await res.arrayBuffer();
          if (this.ctx) {
            const decoded = await this.ctx.decodeAudioData(arrayBuffer);
            this.buffers[key] = decoded;
          }
        } catch (e) {
          // Audio preload fallback
        }
      });
      await Promise.all(promises);
      this.isPreloaded = true;
    } catch (e) {
      // Ignore network errors
    }
  }

  // Helper to play preloaded AudioBuffer with Web Audio API (or HTML5 Audio fallback)
  playBuffer(key, volume = 1.0) {
    try {
      this.init();

      if (this.ctx && this.buffers[key]) {
        const source = this.ctx.createBufferSource();
        const gainNode = this.ctx.createGain();
        source.buffer = this.buffers[key];
        gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(0);
        return;
      }

      // Fallback to HTML5 Audio element
      if (typeof Audio !== "undefined" && this.soundUrls[key]) {
        const audio = new Audio(this.soundUrls[key]);
        audio.volume = Math.min(1.0, Math.max(0.0, volume));
        audio.play().catch(() => {});
      }
    } catch (e) {
      // Audio catch
    }
  }

  // Deep Cinematic Trailer Sub-Bass Boom (For 3... 2... 1...)
  playCountdownBoom(number = 3) {
    this.playBuffer("boom", 1.0);
  }

  // Triumphant Grand Unveil Fanfare (Majestic Orchestral Harmony & Cathedral Reverb)
  playLaunchFanfare() {
    this.playBuffer("fanfare", 1.0);
  }

  // Silent during typing / reveal as chosen by user (no annoying click noises)
  playTypeBlip() {
    // Intentionally silent
  }
}

export const launchAudio = new ProfessionalLaunchSoundEngine();
