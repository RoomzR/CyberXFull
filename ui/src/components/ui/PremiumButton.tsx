import type { ReactNode } from 'react';

type PremiumButtonVariant = 'default' | 'lead';

interface PremiumButtonProps {
  href: string;
  children: ReactNode;
  variant?: PremiumButtonVariant;
  className?: string;
}

const VARIANT_CLASS: Record<PremiumButtonVariant, string> = {
  default: '',
  lead: 'premium-btn--lead',
};

export function PremiumButton({
  href,
  children,
  variant = 'default',
  className = '',
}: PremiumButtonProps) {
  return (
    <a href={href} className={`premium-btn ${VARIANT_CLASS[variant]} ${className}`.trim()}>
      {children}
    </a>
  );
}
