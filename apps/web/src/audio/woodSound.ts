// Web Audio API procedural sound synthesizer for organic wood and joinery acoustics
// Zero external audio files required!

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.initCtx();
      this.playWoodTap(1.1, 0.15); // Confirmation gentle click
    }
    return this.enabled;
  }

  // Realistic wood-on-wood contact tap
  public playWoodTap(pitchMultiplier = 1.0, volume = 0.18) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Fundamental woody resonance
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260 * pitchMultiplier, t);
    osc.frequency.exponentialRampToValueAtTime(140 * pitchMultiplier, t + 0.06);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.08);

    oscGain.gain.setValueAtTime(volume, t);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

    // Micro wood grain friction noise
    const bufferSize = this.ctx.sampleRate * 0.04;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1200;
    noiseFilter.Q.value = 3;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
    noise.start(t);
    noise.stop(t + 0.05);
  }

  // Metallic brass pin sliding and locking into mortise
  public playBrassLock(volume = 0.12) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1850, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.04);

    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);

    // Complement with deep wood settling
    this.playWoodTap(0.85, volume * 1.2);
  }

  // Final structural assembly snap
  public playAssemblyComplete() {
    if (!this.enabled) return;
    this.playWoodTap(0.7, 0.25);
    setTimeout(() => {
      this.playBrassLock(0.18);
    }, 40);
  }
}

export const soundEngine = new SoundEngine();
