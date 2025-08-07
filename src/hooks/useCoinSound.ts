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

  const createRealisticCoinSound = (time: number, pitch: number, volume: number, pan: number) => {
    const ctx = getCtx();
    if (!ctx) return;

    // Fundamental metallic frequency - gold coins have a specific pitch range
    const baseFreq = 900 + pitch * 400; // 900-1300 Hz range for gold
    
    // Primary metallic resonance
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(baseFreq, time);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, time + 0.15);

    // Harmonic overtone (creates the "ring")
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 1.618, time); // Golden ratio harmonic
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.618, time + 0.1);

    // Sharp metallic attack (the "clink")
    const noiseOsc = ctx.createOscillator();
    noiseOsc.type = 'square';
    noiseOsc.frequency.setValueAtTime(baseFreq * 8, time);
    
    // Main envelope - quick attack, medium decay
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.001, time);
    mainGain.gain.exponentialRampToValueAtTime(volume * 0.6, time + 0.002);
    mainGain.gain.exponentialRampToValueAtTime(volume * 0.3, time + 0.02);
    mainGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    // Attack envelope for the clink
    const attackGain = ctx.createGain();
    attackGain.gain.setValueAtTime(volume * 0.4, time);
    attackGain.gain.exponentialRampToValueAtTime(0.001, time + 0.008);

    // Bandpass filter to isolate metallic frequencies
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(baseFreq * 1.2, time);
    bp.Q.value = 8; // Narrow band for metallic quality

    // High-pass for brightness
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 600;

    // Slight reverb effect using delay
    const delay = ctx.createDelay(0.05);
    delay.delayTime.value = 0.01 + Math.random() * 0.02;
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.15;

    // Stereo panning
    const panner = (ctx as any).createStereoPanner ? (ctx as any).createStereoPanner() : null;
    if (panner) panner.pan.setValueAtTime(pan, time);

    // Connect the audio graph
    osc1.connect(mainGain);
    osc2.connect(mainGain);
    noiseOsc.connect(attackGain);
    
    mainGain.connect(bp);
    attackGain.connect(bp);
    bp.connect(hp);
    
    // Add some reverb
    hp.connect(delay);
    delay.connect(delayGain);
    
    if (panner) {
      hp.connect(panner);
      delayGain.connect(panner);
      panner.connect(ctx.destination);
    } else {
      hp.connect(ctx.destination);
      delayGain.connect(ctx.destination);
    }

    // Start and stop oscillators
    osc1.start(time);
    osc1.stop(time + 0.2);
    osc2.start(time);
    osc2.stop(time + 0.12);
    noiseOsc.start(time);
    noiseOsc.stop(time + 0.01);
  };

  const playCoinSpill = () => {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Simulate coins hitting and bouncing with realistic timing
    const coinHits = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < coinHits; i++) {
      const t = now + (i * 0.06) + Math.random() * 0.04; // Staggered hits
      const pitch = 0.3 + Math.random() * 0.7; // Varied pitch for different coins
      const volume = 0.3 + Math.random() * 0.2; // Varied volume
      const pan = -0.7 + Math.random() * 1.4; // Spread across stereo field
      createRealisticCoinSound(t, pitch, volume, pan);
    }
  };

  return { playCoinSpill };
};
