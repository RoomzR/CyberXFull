import type { LucideIcon } from 'lucide-react';

interface IconBoxProps {
  icon: LucideIcon;
  className?: string;
}

export function IconBox({ icon: Icon, className = '' }: IconBoxProps) {
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center border border-white/[0.08] bg-[#050508] ${className}`}
    >
      <Icon size={18} strokeWidth={1.5} className="text-white/60" />
    </div>
  );
}
