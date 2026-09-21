import { motion } from 'framer-motion';

interface OrbConfig {
  id: number;
  size: number;
  color: string;
  duration: number;
  x: [number, number];
  y: [number, number];
  scale: [number, number];
  opacity: [number, number];
  style: React.CSSProperties;
}

const orbs: OrbConfig[] = [
  {
    id: 0,
    size: 780,
    color: 'rgba(255, 26, 26, 0.24)',
    duration: 16,
    x: [0, 80],
    y: [0, -60],
    scale: [1, 1.18],
    opacity: [0.55, 0.95],
    style: { top: '-20%', left: '-14%' },
  },
  {
    id: 1,
    size: 620,
    color: 'rgba(255, 26, 26, 0.16)',
    duration: 20,
    x: [0, -55],
    y: [0, 70],
    scale: [1, 1.12],
    opacity: [0.45, 0.85],
    style: { top: '30%', left: '50%' },
  },
  {
    id: 2,
    size: 520,
    color: 'rgba(200, 0, 40, 0.2)',
    duration: 18,
    x: [0, 45],
    y: [0, -40],
    scale: [0.95, 1.1],
    opacity: [0.5, 0.9],
    style: { bottom: '-18%', right: '-10%' },
  },
  {
    id: 3,
    size: 360,
    color: 'rgba(255, 90, 90, 0.14)',
    duration: 13,
    x: [0, -30],
    y: [0, 35],
    scale: [1, 1.22],
    opacity: [0.4, 0.8],
    style: { top: '12%', right: '15%' },
  },
];

export function NeonNebula() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(255,26,26,0.12),transparent_60%)]" />

      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full blur-[140px] will-change-transform"
          style={{
            width: orb.size,
            height: orb.size,
            background: orb.color,
            ...orb.style,
          }}
          animate={{
            x: orb.x,
            y: orb.y,
            scale: orb.scale,
            opacity: orb.opacity,
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />
      ))}

      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,26,26,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,26,26,0.6) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse at 50% 40%, black 15%, transparent 72%)',
        }}
      />
    </div>
  );
}
