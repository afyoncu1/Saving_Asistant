import { useRef } from 'react';

export const useCoinSound = () => {
  const ctxRef = useRef<AudioContext | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);

  const getCtx = () => {
    if (typeof window === 'undefined') return null as any;
    if (!ctxRef.current) {
      const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      ctxRef.current = new AC();
      compressorRef.current = ctxRef.current.createDynamicsCompressor();
      compressorRef.current.threshold.value = -24;
      compressorRef.current.knee.value = 30;
      compressorRef.current.ratio.value = 12;
      compressorRef.current.attack.value = 0.003;
      compressorRef.current.release.value = 0.25;
      compressorRef.current.connect(ctxRef.current.destination);
    }
    return ctxRef.current;
  };

  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const getNoiseBuffer = (ctx: AudioContext) => {
    if (!noiseBufferRef.current) {
      const length = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / length); // short burst with quick decay
      }
      noiseBufferRef.current = buffer;
    }
    return noiseBufferRef.current;
  };

  const playTink = (time: number, pan: number) => {
    const ctx = getCtx();
    if (!ctx) return;

    const destination: AudioNode = compressorRef.current ?? ctx.destination;

    // Metallic ping
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    const baseFreq = 1500 + Math.random() * 1400; // 1.5k - 2.9k
    osc.frequency.setValueAtTime(baseFreq, time);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, time + 0.12);

    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.setValueAtTime(1800 + Math.random() * 800, time);
    band.Q.value = 10;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.25, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);

    const panner = (ctx as any).createStereoPanner ? (ctx as any).createStereoPanner() : null;
    if (panner) panner.pan.setValueAtTime(pan, time);

    // Highpassed noise click
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = getNoiseBuffer(ctx);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1000 + Math.random() * 600;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.12, time);
    ng.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);

    // Wire up
    osc.connect(band);
    band.connect(gain);
    if (panner) {
      gain.connect(panner);
      panner.connect(destination);
      noiseSrc.connect(hp);
      hp.connect(ng);
      ng.connect(panner);
    } else {
      gain.connect(destination);
      noiseSrc.connect(hp);
      hp.connect(ng);
      ng.connect(destination);
    }

    osc.start(time);
    osc.stop(time + 0.25);
    noiseSrc.start(time);
    noiseSrc.stop(time + 0.1);
  };

  const playCoinSpill = () => {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const hits = 14 + Math.floor(Math.random() * 6);
    for (let i = 0; i < hits; i++) {
      const t = now + Math.random() * 0.65; // spread over ~650ms
      const pan = -0.8 + Math.random() * 1.6; // -0.8 to 0.8
      playTink(t, pan);
    }
  };

  return { playCoinSpill };
};
