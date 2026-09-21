import { useRef, useState, type MouseEvent, type ReactNode } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function SpotlightCard({
  children,
  className = '',
  glowColor = 'rgba(255, 26, 26, 0.35)',
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 0, y: 0, active: false });

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setSpot({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true,
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
      className={`group relative overflow-hidden border border-white/[0.08] bg-[#111116]/40 backdrop-blur-xl ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: spot.active ? 1 : 0,
          background: `radial-gradient(520px circle at ${spot.x}px ${spot.y}px, ${glowColor}, transparent 42%)`,
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: spot.active
            ? `radial-gradient(280px circle at ${spot.x}px ${spot.y}px, rgba(255,26,26,0.5), transparent 50%)`
            : undefined,
          boxShadow: spot.active ? 'inset 0 0 0 1px rgba(255,26,26,0.4)' : undefined,
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
