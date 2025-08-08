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

    // Short, instant coin sound
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, time); // High frequency
    osc.frequency.exponentialRampToValueAtTime(1900, time + 0.2); // Quick pitch decay

    // Short, punchy envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.exponentialRampToValueAtTime(volume, time + 0.005); // Very quick attack
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3); // Quick decay

    // Connect and play
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.3);
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
