import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect } from 'react';

export function CursorTrail() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 20 });
  const springY = useSpring(y, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  return (
    <>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998] hidden md:block"
        style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
        aria-hidden
      >
        <div className="h-8 w-8 rounded-full border border-cyber-primary/30" />
      </motion.div>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9997] hidden md:block"
        style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
        aria-hidden
      >
        <div className="h-64 w-64 rounded-full bg-cyber-primary/5 blur-3xl" />
      </motion.div>
    </>
  );
}
