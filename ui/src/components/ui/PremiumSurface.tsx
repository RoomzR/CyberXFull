import type { ElementType, ReactNode } from 'react';

interface PremiumSurfaceProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

export function PremiumSurface({ children, className = '', as: Tag = 'div' }: PremiumSurfaceProps) {
  return (
    <Tag className={`premium-surface ${className}`.trim()}>
      <div className="premium-surface__inner">{children}</div>
    </Tag>
  );
}
