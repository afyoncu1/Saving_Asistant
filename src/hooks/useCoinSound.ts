import { useRef } from 'react';

export const useCoinSound = () => {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (typeof window === 'undefined') return null as any;
    if (!ctxRef.current) {
      const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      ctxRef.current = new AC();
    }
    return ctxRef.current;
  };

  const playMetallicClink = (time: number, pitch: number, pan: number) => {
    const ctx = getCtx();
    if (!ctx) return;

    // Primary metallic tone
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    const freq = 800 + pitch * 600; // 800-1400 Hz range
    osc1.frequency.setValueAtTime(freq, time);
    osc1.frequency.exponentialRampToValueAtTime(freq * 0.3, time + 0.08);

    // Harmonic overtone
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.1, time);
    osc2.frequency.exponentialRampToValueAtTime(freq * 0.7, time + 0.05);

    // Sharp click component
    const osc3 = ctx.createOscillator();
    osc3.type = 'square';
    osc3.frequency.setValueAtTime(freq * 4, time);

    // Main gain envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(0.4, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    // Click envelope
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.2, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.01);

    // High-pass for metallic brightness
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 400;

    // Panning
    const panner = (ctx as any).createStereoPanner ? (ctx as any).createStereoPanner() : null;
    if (panner) panner.pan.setValueAtTime(pan, time);

    // Connect everything
    osc1.connect(gain);
    osc2.connect(gain);
    osc3.connect(clickGain);
    
    gain.connect(hp);
    clickGain.connect(hp);
    
    if (panner) {
      hp.connect(panner);
      panner.connect(ctx.destination);
    } else {
      hp.connect(ctx.destination);
    }

    // Start and stop
    osc1.start(time);
    osc1.stop(time + 0.15);
    osc2.start(time);
    osc2.stop(time + 0.08);
    osc3.start(time);
    osc3.stop(time + 0.015);
  };

  const playCoinSpill = () => {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Rapid sequence of coin clinks like spilling coins
    const clinks = 8 + Math.floor(Math.random() * 4);
    for (let i = 0; i < clinks; i++) {
      const t = now + (i * 0.04) + Math.random() * 0.03; // ~40ms apart with variation
      const pitch = Math.random(); // random pitch variation
      const pan = -0.6 + Math.random() * 1.2; // spread across stereo field
      playMetallicClink(t, pitch, pan);
    }
  };

  return { playCoinSpill };
};
