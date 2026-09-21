import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { springManifest } from '../../lib/motion';

type NeonButtonVariant = 'primary' | 'secondary' | 'ghost';

interface NeonButtonProps extends Omit<HTMLMotionProps<'a'>, 'children'> {
  children: ReactNode;
  variant?: NeonButtonVariant;
  /** Brighter sweep + stronger glow — for featured CTAs (Ultra, main tournament) */
  intense?: boolean;
  className?: string;
}

const variants: Record<NeonButtonVariant, string> = {
  primary:
    'bg-[#FF1A1A] text-white shadow-[0_0_40px_rgba(255,26,26,0.45)] hover:shadow-[0_0_70px_rgba(255,26,26,0.65)]',
  secondary:
    'border border-white/20 bg-white/[0.04] text-white backdrop-blur-md hover:border-white/40 hover:shadow-[0_0_40px_rgba(255,255,255,0.08)]',
  ghost:
    'border border-[#FF1A1A]/40 text-[#FF1A1A] hover:shadow-[0_0_50px_rgba(255,26,26,0.35)] hover:border-[#FF1A1A]',
};

export function NeonButton({
  children,
  variant = 'primary',
  intense = false,
  className = '',
  ...rest
}: NeonButtonProps) {
  const intensePrimary =
    intense && variant === 'primary'
      ? 'shadow-[0_0_60px_rgba(255,26,26,0.55)] hover:shadow-[0_0_90px_rgba(255,26,26,0.8)]'
      : '';

  return (
    <motion.a
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={springManifest}
      className={`group relative inline-flex items-center justify-center gap-3 overflow-hidden px-10 py-4 text-xs font-black uppercase tracking-[0.28em] transition-shadow duration-500 ${variants[variant]} ${intensePrimary} ${className}`}
      style={{
        clipPath:
          'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
      }}
      {...rest}
    >
      {variant === 'primary' && (
        <>
          <span
            aria-hidden
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform ease-out ${
              intense
                ? 'translate-x-[-120%] duration-500 group-hover:translate-x-[120%]'
                : 'translate-x-[-100%] duration-700 group-hover:translate-x-[100%]'
            }`}
          />
          <span
            aria-hidden
            className={`absolute inset-0 transition-opacity duration-500 group-hover:opacity-100 ${
              intense ? 'opacity-30' : 'opacity-0'
            }`}
            style={{
              background: intense
                ? 'linear-gradient(135deg, rgba(255,26,26,1) 0%, rgba(255,140,140,0.95) 40%, rgba(255,60,60,1) 60%, rgba(255,26,26,1) 100%)'
                : 'linear-gradient(135deg, rgba(255,26,26,0.9) 0%, rgba(255,100,100,0.8) 50%, rgba(255,26,26,0.9) 100%)',
            }}
          />
        </>
      )}
      <span className="relative z-10 flex items-center justify-center gap-3">{children}</span>
    </motion.a>
  );
}
