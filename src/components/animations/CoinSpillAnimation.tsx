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

    const total = 14;
    for (let i = 0; i < total; i++) {
      const isLeft = i % 2 === 0;
      const spread = isLeft ? -1 : 1;
      const leftOffsetPct = (Math.random() * 10 - 5); // around center
      const delay = 0.05 + i * 0.06 + Math.random() * 0.03;
      const duration = 1.0 + Math.random() * 0.6;
      const xMid = spread * (40 + Math.random() * 40); // px
      const xEnd = spread * (90 + Math.random() * 80); // px
      const size = i < 6 ? 1.25 : 0.9 + Math.random() * 0.4; // some big coins first
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
          className="absolute animate-coin-arc"
          style={{
            left: `calc(50% + ${c.leftOffsetPct}%)`,
            bottom: '18px',
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
