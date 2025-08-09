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

  const createCoinBounce = (time: number, pitch: number, volume: number, bounces: number = 2) => {
    const ctx = getCtx();
    if (!ctx) return;

    // Create multiple bounces for each coin
    for (let i = 0; i <= bounces; i++) {
      const bounceTime = time + (i * 0.12);
      const bounceVolume = volume * (1 - i * 0.3); // Decreasing volume
      const bouncePitch = pitch * (1 - i * 0.05); // Slightly lower pitch each bounce
      
      // Metallic coin sound with harmonics
      const fundamental = ctx.createOscillator();
      const harmonic1 = ctx.createOscillator();
      const harmonic2 = ctx.createOscillator();
      
      fundamental.type = 'sine';
      harmonic1.type = 'sine';
      harmonic2.type = 'triangle';
      
      // Fundamental frequency
      fundamental.frequency.setValueAtTime(bouncePitch, bounceTime);
      fundamental.frequency.exponentialRampToValueAtTime(bouncePitch * 0.8, bounceTime + 0.15);
      
      // Harmonics for metallic sound
      harmonic1.frequency.setValueAtTime(bouncePitch * 1.5, bounceTime);
      harmonic1.frequency.exponentialRampToValueAtTime(bouncePitch * 1.2, bounceTime + 0.15);
      
      harmonic2.frequency.setValueAtTime(bouncePitch * 2.2, bounceTime);
      harmonic2.frequency.exponentialRampToValueAtTime(bouncePitch * 1.8, bounceTime + 0.15);

      // Envelope for realistic bounce
      const gain = ctx.createGain();
      const harmonicGain1 = ctx.createGain();
      const harmonicGain2 = ctx.createGain();
      
      // Sharp attack, quick decay for bounce effect
      gain.gain.setValueAtTime(0, bounceTime);
      gain.gain.exponentialRampToValueAtTime(bounceVolume, bounceTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, bounceTime + 0.2);
      
      harmonicGain1.gain.setValueAtTime(0, bounceTime);
      harmonicGain1.gain.exponentialRampToValueAtTime(bounceVolume * 0.3, bounceTime + 0.008);
      harmonicGain1.gain.exponentialRampToValueAtTime(0.001, bounceTime + 0.15);
      
      harmonicGain2.gain.setValueAtTime(0, bounceTime);
      harmonicGain2.gain.exponentialRampToValueAtTime(bounceVolume * 0.2, bounceTime + 0.008);
      harmonicGain2.gain.exponentialRampToValueAtTime(0.001, bounceTime + 0.1);

      // Connect oscillators
      fundamental.connect(gain);
      harmonic1.connect(harmonicGain1);
      harmonic2.connect(harmonicGain2);
      
      gain.connect(ctx.destination);
      harmonicGain1.connect(ctx.destination);
      harmonicGain2.connect(ctx.destination);
      
      // Play the bounce
      const duration = 0.25;
      fundamental.start(bounceTime);
      harmonic1.start(bounceTime);
      harmonic2.start(bounceTime);
      fundamental.stop(bounceTime + duration);
      harmonic1.stop(bounceTime + duration);
      harmonic2.stop(bounceTime + duration);
    }
  };

  const playCoinSpill = () => {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Create a cascade of coins with different pitches and timing
    const coinPitches = [1800, 1600, 1900, 1500, 1700, 1400, 1650, 1550];
    
    coinPitches.forEach((pitch, i) => {
      const delay = i * 0.08 + Math.random() * 0.05; // Stagger the coins
      const volume = 0.15 + Math.random() * 0.1; // Vary volume slightly
      const bounces = Math.floor(Math.random() * 3) + 1; // 1-3 bounces per coin
      
      createCoinBounce(now + delay, pitch, volume, bounces);
    });
    
    // Add some scattered late coins
    setTimeout(() => {
      [1750, 1450].forEach((pitch, i) => {
        createCoinBounce(ctx.currentTime + i * 0.1, pitch, 0.08, 1);
      });
    }, 500);
  };

  return { playCoinSpill };
};
