import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { useCallback, useEffect, useRef, type CSSProperties } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

const ORBS: {
  size: number;
  color: string;
  duration: number;
  x: [number, number];
  y: [number, number];
  style: CSSProperties;
  parallax: number;
}[] = [
  { size: 680, color: 'rgba(255, 26, 26, 0.18)', duration: 18, x: [0, 60], y: [0, -40], style: { top: '-18%', left: '-12%' }, parallax: 28 },
  { size: 520, color: 'rgba(255, 26, 26, 0.12)', duration: 22, x: [0, -50], y: [0, 55], style: { bottom: '-15%', right: '-8%' }, parallax: 18 },
  { size: 380, color: 'rgba(255, 60, 60, 0.1)', duration: 15, x: [0, 35], y: [0, -25], style: { top: '35%', right: '10%' }, parallax: 22 },
];

const PARTICLE_COUNT = 88;
const LINK_DISTANCE = 130;

function createParticles(width: number, height: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    radius: Math.random() * 1.2 + 0.4,
    alpha: Math.random() * 0.35 + 0.15,
  }));
}

function OrbLayer({
  orb,
  springX,
  springY,
}: {
  orb: (typeof ORBS)[number];
  springX: MotionValue<number>;
  springY: MotionValue<number>;
}) {
  const offsetX = useTransform(springX, (v) => v * (orb.parallax / 40));
  const offsetY = useTransform(springY, (v) => v * (orb.parallax / 30));

  return (
    <motion.div className="hero-backdrop__orb-wrap" style={{ x: offsetX, y: offsetY, ...orb.style }}>
      <motion.div
        className="hero-backdrop__orb"
        style={{ width: orb.size, height: orb.size, background: orb.color }}
        animate={{ x: orb.x, y: orb.y }}
        transition={{
          duration: orb.duration,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}

export function HeroBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 40, damping: 20 });
  const springY = useSpring(pointerY, { stiffness: 40, damping: 20 });

  const flareX = useTransform(springX, (v) => v * 0.6);
  const flareY = useTransform(springY, (v) => v * 0.4);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 40);
      pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 30);
    },
    [pointerX, pointerY, reduceMotion],
  );

  const handlePointerLeave = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  useEffect(() => {
    if (reduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    let particles: Particle[] = [];

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = createParticles(width, height);
    };

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;
        particle.x = Math.max(0, Math.min(width, particle.x));
        particle.y = Math.max(0, Math.min(height, particle.y));
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK_DISTANCE) {
            const fade = 1 - dist / LINK_DISTANCE;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 26, 26, ${fade * 0.14})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const particle of particles) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [reduceMotion]);

  return (
    <div
      className="hero-backdrop"
      aria-hidden
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {!reduceMotion && <canvas ref={canvasRef} className="hero-backdrop__canvas" />}

      <div className="hero-backdrop__grid" />
      <div className="hero-backdrop__scan" />
      <div className="hero-backdrop__noise" />
      <motion.div className="hero-backdrop__flare" style={{ x: flareX, y: flareY }} />
      <div className="hero-backdrop__vignette" />

      {!reduceMotion &&
        ORBS.map((orb, index) => (
          <OrbLayer key={index} orb={orb} springX={springX} springY={springY} />
        ))}

      <div className="hero-backdrop__pulse-ring" />
      <div className="hero-backdrop__pulse-ring hero-backdrop__pulse-ring--delayed" />
    </div>
  );
}
