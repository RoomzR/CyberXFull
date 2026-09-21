interface BrandBadgeProps {
  children: string;
}

export function BrandBadge({ children }: BrandBadgeProps) {
  return (
    <div className="brand-badge">
      <span className="brand-badge__ping-wrap" aria-hidden>
        <span className="brand-badge__ping" />
        <span className="brand-badge__dot" />
      </span>
      <span>{children}</span>
    </div>
  );
}
