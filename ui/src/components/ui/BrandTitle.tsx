interface BrandTitleProps {
  size?: 'hero' | 'loader';
  className?: string;
}

export function BrandTitle({ size = 'hero', className = '' }: BrandTitleProps) {
  const sizeClass = size === 'loader' ? 'text-4xl md:text-5xl' : 'brand-title';

  return (
    <h1 className={`${sizeClass} uppercase tracking-tighter ${className}`.trim()}>
      <span className="text-cyber-white">CYBER</span>
      <span className="brand-x-wrap">
        <span className="brand-x-glow" aria-hidden />
        <span className="relative text-cyber-x">X</span>
      </span>
    </h1>
  );
}
