import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { easeCyber } from '../../lib/motion';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 15 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: easeCyber }}
      className="mb-16 md:mb-20"
    >
      <h2 className="font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3.5rem)] font-bold uppercase leading-none tracking-tighter text-white">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/50 md:text-lg">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
