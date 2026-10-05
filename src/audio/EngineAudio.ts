/**
 * APEX-ONE — Twin-Turbo V8 Synthesizer
 * Web Audio API • no samples • startup + idle + rev
 */

type OscBank = {
  osc: OscillatorNode;
  gain: GainNode;
  filter: BiquadFilterNode;
};

export class EngineAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private engineGain: GainNode | null = null;

  private banks: OscBank[] = [];
  private noise: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private noiseGain: GainNode | null = null;

  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  private started = false;
  private engineOn = false;
  private muted = false;

  private rpm = 0; // 0–1 normalized
  private targetRpm = 0;

  private raf = 0;

  /* ── lifecycle ── */
  async ensure() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0.7;
    this.master.connect(this.ctx.destination);

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0;
    this.engineGain.connect(this.master);

    this.buildGraph();
  }

  private buildGraph() {
    if (!this.ctx || !this.engineGain) return;
    const ctx = this.ctx;

    // Harmonic banks — V8-ish partials (detuned)
    const partials: { type: OscillatorType; ratio: number; gain: number; q: number; freq: number }[] = [
      { type: 'sawtooth', ratio: 1.0, gain: 0.22, q: 2.5, freq: 55 },
      { type: 'sawtooth', ratio: 1.5, gain: 0.12, q: 3.0, freq: 82 },
      { type: 'square', ratio: 2.0, gain: 0.08, q: 4.0, freq: 110 },
      { type: 'sawtooth', ratio: 3.0, gain: 0.05, q: 2.0, freq: 165 },
      { type: 'triangle', ratio: 0.5, gain: 0.14, q: 1.2, freq: 40 },
    ];

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

    // Exhaust hiss / turbo whoosh (filtered noise)
    const noiseBuf = this.makeNoiseBuffer(2);
    this.noise = ctx.createBufferSource();
    this.noise.buffer = noiseBuf;
    this.noise.loop = true;

    this.noiseFilter = ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.value = 1200;
    this.noiseFilter.Q.value = 0.8;

    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0.03;

    this.noise.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.engineGain);

    // Idle lope LFO (cylinder chop)
    this.lfo = ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 8; // ~idle lope

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
      // Deterministic-ish noise (no Math.random in React tree — fine here in audio util)
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

  /* ── public API ── */
  async startEngine() {
    await this.ensure();
    if (this.ctx!.state === 'suspended') await this.ctx!.resume();
    this.startNodes();
    this.engineOn = true;

    // Crank → catch → idle startup envelope
    const g = this.engineGain!;
    const now = this.ctx!.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(0, now);
    // Starter grind swell
    g.gain.linearRampToValueAtTime(0.35, now + 0.15);
    g.gain.linearRampToValueAtTime(0.08, now + 0.35);
    // Catch
    g.gain.linearRampToValueAtTime(0.55, now + 0.55);
    // Settle idle
    g.gain.linearRampToValueAtTime(0.28, now + 1.1);

    this.targetRpm = 0.08; // idle
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
    // 0 = idle, 1 = redline scream
    this.targetRpm = Math.max(0, Math.min(1, normalized));
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.master || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(muted ? 0 : 0.7, now + 0.12);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    try {
      this.banks.forEach((b) => b.osc.stop());
      this.noise?.stop();
      this.lfo?.stop();
      this.ctx?.close();
    } catch {
      /* already stopped */
    }
    this.ctx = null;
    this.started = false;
  }

  /* ── realtime voice ── */
  private tick = () => {
    this.raf = requestAnimationFrame(this.tick);
    if (!this.ctx || !this.engineOn) return;

    // Smooth rpm
    this.rpm += (this.targetRpm - this.rpm) * 0.08;
    const rpm = this.rpm;

    // Base frequency climbs with rpm (idle ~45Hz → redline ~220Hz fundamental)
    const baseFreq = 45 + rpm * 180;

    this.banks.forEach((b, i) => {
      const ratios = [1, 1.5, 2, 3, 0.5];
      const freq = baseFreq * ratios[i];
      b.osc.frequency.setTargetAtTime(freq, this.ctx!.currentTime, 0.04);

      // Open the filter as we rev (more growl / presence)
      const cutoff = 350 + rpm * 4200;
      b.filter.frequency.setTargetAtTime(cutoff, this.ctx!.currentTime, 0.05);

      // Upper harmonics swell at high rpm
      const harmonicBoost = i >= 2 ? 0.04 + rpm * 0.12 : 0;
      const baseGains = [0.22, 0.12, 0.08, 0.05, 0.14];
      b.gain.gain.setTargetAtTime(
        (baseGains[i] + harmonicBoost) * (0.7 + rpm * 0.5),
        this.ctx!.currentTime,
        0.05
      );
    });

    // Turbo / exhaust noise
    if (this.noiseFilter && this.noiseGain) {
      this.noiseFilter.frequency.setTargetAtTime(
        900 + rpm * 3200,
        this.ctx.currentTime,
        0.06
      );
      this.noiseGain.gain.setTargetAtTime(
        0.02 + rpm * 0.09,
        this.ctx.currentTime,
        0.06
      );
    }

    // Idle lope stronger at low rpm, smooths out on rev
    if (this.lfo && this.lfoGain) {
      this.lfo.frequency.setTargetAtTime(
        7 + rpm * 14,
        this.ctx.currentTime,
        0.08
      );
      this.lfoGain.gain.setTargetAtTime(
        (1 - rpm) * 0.04,
        this.ctx.currentTime,
        0.08
      );
    }

    // Overall level climbs slightly with rpm
    if (this.engineGain) {
      const body = 0.26 + rpm * 0.45;
      // Don't fight startup envelope hard — gentle chase
      const current = this.engineGain.gain.value;
      if (current > 0.05) {
        this.engineGain.gain.setTargetAtTime(body, this.ctx.currentTime, 0.1);
      }
    }
  };
}

/** Singleton — one engine voice for the app */
let singleton: EngineAudio | null = null;
export function getEngineAudio(): EngineAudio {
  if (!singleton) singleton = new EngineAudio();
  return singleton;
}