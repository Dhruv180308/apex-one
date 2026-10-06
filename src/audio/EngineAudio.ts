/**
 * APEX-ONE — Multi-Profile Web Audio Synthesizer Engine
 * Pure procedural synthesis for V8-Turbo, V12-NA, and Quad-EV Powertrains
 */

export type AudioEngineType = 'v8-turbo' | 'v12-na' | 'v10-na' | 'quad-ev' | 'bike-inline4';

type OscBank = {
  osc: OscillatorNode;
  gain: GainNode;
  filter: BiquadFilterNode;
};

export class EngineAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private engineGain: GainNode | null = null;

  private profile: AudioEngineType = 'v8-turbo';

  private banks: OscBank[] = [];
  private noise: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private noiseGain: GainNode | null = null;

  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  private started = false;
  private engineOn = false;

  private rpm = 0; // 0–1 normalized
  private targetRpm = 0;

  private raf = 0;

  /* ── Context Lifecycle ── */
  async ensure() {
    if (this.ctx) return;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0.7;
    this.master.connect(this.ctx.destination);

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0;
    this.engineGain.connect(this.master);

    this.buildGraph();
  }

  public setProfile(profile: AudioEngineType) {
    if (this.profile === profile) return;
    this.profile = profile;

    // Rebuild audio nodes if audio context is active
    if (this.ctx && this.started) {
      this.teardownGraph();
      this.buildGraph();
      if (this.engineOn) {
        this.banks.forEach((b) => b.osc.start());
        this.noise?.start();
        this.lfo?.start();
      }
    }
  }

  private teardownGraph() {
    try {
      this.banks.forEach((b) => {
        b.osc.stop();
        b.osc.disconnect();
      });
      this.banks = [];

      if (this.noise) {
        this.noise.stop();
        this.noise.disconnect();
      }
      if (this.lfo) {
        this.lfo.stop();
        this.lfo.disconnect();
      }
    } catch {
      /* ignore node teardown edge cases */
    }
  }

  private buildGraph() {
    if (!this.ctx || !this.engineGain) return;
    const ctx = this.ctx;

    // Harmonic partials tuned per engine profile
    let partials: { type: OscillatorType; ratio: number; gain: number; q: number; freq: number }[] = [];

    if (this.profile === 'v12-na') {
      // Pagani V12: High-pitch screaming harmonics
      partials = [
        { type: 'sawtooth', ratio: 1.0, gain: 0.18, q: 3.5, freq: 85 },
        { type: 'sawtooth', ratio: 2.0, gain: 0.14, q: 4.5, freq: 170 },
        { type: 'sawtooth', ratio: 3.0, gain: 0.10, q: 5.0, freq: 255 },
        { type: 'square', ratio: 4.0, gain: 0.06, q: 6.0, freq: 340 },
        { type: 'triangle', ratio: 0.5, gain: 0.12, q: 2.0, freq: 42.5 },
      ];
    } else if (this.profile === 'quad-ev') {
      // Rimac Quad EV: Sine + High-pitch Inverter Whine
      partials = [
        { type: 'sine', ratio: 1.0, gain: 0.25, q: 1.0, freq: 120 },
        { type: 'sine', ratio: 2.5, gain: 0.18, q: 2.0, freq: 300 },
        { type: 'triangle', ratio: 4.0, gain: 0.12, q: 3.0, freq: 480 },
        { type: 'sawtooth', ratio: 8.0, gain: 0.05, q: 8.0, freq: 960 },
      ];
    } else {
      // Default: Koenigsegg V8-Turbo
      partials = [
        { type: 'sawtooth', ratio: 1.0, gain: 0.22, q: 2.5, freq: 55 },
        { type: 'sawtooth', ratio: 1.5, gain: 0.12, q: 3.0, freq: 82 },
        { type: 'square', ratio: 2.0, gain: 0.08, q: 4.0, freq: 110 },
        { type: 'sawtooth', ratio: 3.0, gain: 0.05, q: 2.0, freq: 165 },
        { type: 'triangle', ratio: 0.5, gain: 0.14, q: 1.2, freq: 40 },
      ];
    }

    this.banks = partials.map((p) => {
      const osc = ctx.createOscillator();
      osc.type = p.type;
      osc.frequency.value = p.freq;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      filter.Q.value = p.q;

      const gain = ctx.createGain();
      gain.gain.value = p.gain;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.engineGain!);

      return { osc, gain, filter };
    });

    // Exhaust noise / Turbo hiss / EV Inverter hum
    const noiseBuf = this.makeNoiseBuffer(2);
    this.noise = ctx.createBufferSource();
    this.noise.buffer = noiseBuf;
    this.noise.loop = true;

    this.noiseFilter = ctx.createBiquadFilter();
    this.noiseFilter.type = this.profile === 'quad-ev' ? 'highpass' : 'bandpass';
    this.noiseFilter.frequency.value = this.profile === 'quad-ev' ? 2400 : 1200;
    this.noiseFilter.Q.value = 1.2;

    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0.03;

    this.noise.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.engineGain);

    // Idle lope LFO
    this.lfo = ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = this.profile === 'quad-ev' ? 2 : 8;

    this.lfoGain = ctx.createGain();
    this.lfoGain.gain.value = 0;
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.engineGain.gain);
  }

  private makeNoiseBuffer(seconds: number): AudioBuffer {
    const ctx = this.ctx!;
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.6;
    }
    return buf;
  }

  private startNodes() {
    if (!this.ctx || this.started) return;
    this.banks.forEach((b) => b.osc.start());
    this.noise?.start();
    this.lfo?.start();
    this.started = true;
    this.tick();
  }

  /* ── Public Ignition API ── */
  async startEngine() {
    await this.ensure();
    if (this.ctx!.state === 'suspended') await this.ctx!.resume();
    this.startNodes();
    this.engineOn = true;

    const g = this.engineGain!;
    const now = this.ctx!.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(0, now);

    if (this.profile === 'quad-ev') {
      // Instant high-voltage power-up chime
      g.gain.linearRampToValueAtTime(0.45, now + 0.15);
      g.gain.linearRampToValueAtTime(0.2, now + 0.4);
    } else {
      // Starter crank -> V8/V12 engine catch
      g.gain.linearRampToValueAtTime(0.35, now + 0.15);
      g.gain.linearRampToValueAtTime(0.08, now + 0.35);
      g.gain.linearRampToValueAtTime(0.55, now + 0.55);
      g.gain.linearRampToValueAtTime(0.28, now + 1.1);
    }

    this.targetRpm = 0.08;
  }

  stopEngine() {
    if (!this.ctx || !this.engineGain) return;
    this.engineOn = false;
    this.targetRpm = 0;
    const g = this.engineGain;
    const now = this.ctx.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.linearRampToValueAtTime(0, now + 0.45);
  }

  setRpm(normalized: number) {
    this.targetRpm = Math.max(0, Math.min(1, normalized));
  }

  setMuted(muted: boolean) {
    if (!this.master || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(muted ? 0 : 0.7, now + 0.12);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.teardownGraph();
    this.ctx?.close();
    this.ctx = null;
    this.started = false;
  }

  /* ── Realtime Audio Frame Tick ── */
  private tick = () => {
    this.raf = requestAnimationFrame(this.tick);
    if (!this.ctx || !this.engineOn) return;

    this.rpm += (this.targetRpm - this.rpm) * 0.08;
    const rpm = this.rpm;

    if (this.profile === 'quad-ev') {
      // EV Quad Motor: Base freq sweeps 120Hz -> 2,800Hz
      const baseFreq = 120 + rpm * 2680;
      this.banks.forEach((b, i) => {
        const ratios = [1, 2.5, 4.0, 8.0];
        b.osc.frequency.setTargetAtTime(baseFreq * ratios[i], this.ctx!.currentTime, 0.04);
        b.filter.frequency.setTargetAtTime(1000 + rpm * 8000, this.ctx!.currentTime, 0.05);
      });
    } else if (this.profile === 'v12-na') {
      // V12 Screamer: Base freq sweeps 85Hz -> 520Hz (Screaming redline)
      const baseFreq = 85 + rpm * 435;
      this.banks.forEach((b, i) => {
        const ratios = [1, 2.0, 3.0, 4.0, 0.5];
        b.osc.frequency.setTargetAtTime(baseFreq * ratios[i], this.ctx!.currentTime, 0.03);
        b.filter.frequency.setTargetAtTime(500 + rpm * 6500, this.ctx!.currentTime, 0.04);
      });
    } else {
      // V8 Turbo: Base freq sweeps 45Hz -> 220Hz
      const baseFreq = 45 + rpm * 180;
      this.banks.forEach((b, i) => {
        const ratios = [1, 1.5, 2, 3, 0.5];
        b.osc.frequency.setTargetAtTime(baseFreq * ratios[i], this.ctx!.currentTime, 0.04);
        b.filter.frequency.setTargetAtTime(350 + rpm * 4200, this.ctx!.currentTime, 0.05);
      });
    }
  };
}

let singleton: EngineAudio | null = null;
export function getEngineAudio(): EngineAudio {
  if (!singleton) singleton = new EngineAudio();
  return singleton;
}