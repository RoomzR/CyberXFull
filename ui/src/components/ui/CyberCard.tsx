import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { cardHover, scaleIn } from '../../lib/motion';

interface CyberCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  featured?: boolean;
  index?: number;
  className?: string;
  innerClassName?: string;
}

export function CyberCard({
  children,
  featured = false,
  index = 0,
  className = '',
  innerClassName = '',
  ...rest
}: CyberCardProps) {
  return (
    <motion.div
      variants={scaleIn}
      custom={index}
      {...cardHover}
      className={`group relative ${className}`}
      {...rest}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-2 opacity-0 transition-opacity duration-600 group-hover:opacity-100"
        style={{
          boxShadow: '0 24px 64px rgba(255, 26, 26, 0.1)',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      <div
        className={`relative h-full border bg-[#111116] transition-colors duration-600 group-hover:border-[#FF1A1A] ${
          featured ? 'border-[rgba(255,26,26,0.2)]' : 'border-white/[0.05]'
        } ${innerClassName}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {children}
      </div>
    </motion.div>
  );
}
