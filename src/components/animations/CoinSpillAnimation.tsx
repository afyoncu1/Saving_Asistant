import React, { useMemo } from 'react';

interface CoinSpillAnimationProps {
  active?: boolean;
}

const CoinSpillAnimation: React.FC<CoinSpillAnimationProps> = ({ active = true }) => {
  const coins = useMemo(() => {
    const arr: Array<{
      id: string;
      leftOffsetPct: number;
      delay: number;
      duration: number;
      xMid: number;
      xEnd: number;
      size: number; // scale factor
    }> = [];

    const total = 10;
    for (let i = 0; i < total; i++) {
      const isLeft = i % 2 === 0;
      const spread = isLeft ? -1 : 1;
      const leftOffsetPct = (Math.random() * 6 - 3); // around center
      const delay = 0.1 + i * 0.08 + Math.random() * 0.05;
      const duration = 1.2 + Math.random() * 0.3;
      // Start from top, spread as falling down
      const xMid = spread * (30 + Math.random() * 20); // px - gradual spread
      const xEnd = spread * (80 + Math.random() * 60); // px - final spread
      const size = i < 3 ? 1.6 : 0.9 + Math.random() * 0.8; // some big coins first
      arr.push({ id: `coin-${i}`, leftOffsetPct, delay, duration, xMid, xEnd, size });
    }
    return arr;
  }, []);

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {coins.map(c => (
        <div
          key={c.id}
          className="absolute animate-coin-fall-spill"
          style={{
            left: `calc(50% + ${c.leftOffsetPct}%)`,
            top: '0px', // Start from top
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
            // CSS vars used inside keyframes
            ['--x-mid' as any]: `${c.xMid}px`,
            ['--x-end' as any]: `${c.xEnd}px`,
            ['--scale' as any]: c.size,
          } as React.CSSProperties}
        >
          <div
            className="rounded-full bg-gold text-gold-foreground flex items-center justify-center shadow-md"
            style={{ width: `${24 * c.size}px`, height: `${24 * c.size}px`, boxShadow: '0 0 14px rgba(255,215,0,0.35)' }}
          >
            <span className="text-[10px] font-bold">$</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoinSpillAnimation;
