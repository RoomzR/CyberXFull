import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  accent?: boolean;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = '',
  accent = false,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 2.4,
      ease: PREMIUM_EASE,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  const toneClass = accent ? 'counter-value counter-value--accent' : 'counter-value';

  return (
    <span ref={ref} className={`${toneClass} ${className}`.trim()}>
      {display.toLocaleString('ru-RU')}
      {suffix}
    </span>
  );
}
