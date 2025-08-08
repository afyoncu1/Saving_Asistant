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

  const createHighPitchedRing = (time: number, volume: number) => {
    const ctx = getCtx();
    if (!ctx) return;

    // High-pitched ringing sound (like a bell or chime)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, time); // High frequency
    osc.frequency.exponentialRampToValueAtTime(1800, time + 1.5); // Slight pitch decay

    // Long decay envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.exponentialRampToValueAtTime(volume, time + 0.01); // Quick attack
    gain.gain.exponentialRampToValueAtTime(volume * 0.3, time + 0.5); // Sustain
    gain.gain.exponentialRampToValueAtTime(0.001, time + 2.0); // Long decay

    // Connect and play
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + 2.0);
  };

  const playCoinSpill = () => {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Play a single long high-pitched ringing sound
    createHighPitchedRing(now, 0.4);
  };

  return { playCoinSpill };
};
