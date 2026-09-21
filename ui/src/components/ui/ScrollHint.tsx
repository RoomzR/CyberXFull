import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ScrollHintProps {
  onClick: () => void;
}

export function ScrollHint({ onClick }: ScrollHintProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      className="scroll-hint-btn group absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 p-2"
      aria-label={t('hero.scroll_to_about')}
    >
      <span className="mono-label text-[9px] transition-colors duration-500 group-hover:text-white/70">
        {t('hero.scroll_label')}
      </span>
      <div className="flex animate-lazy-bounce flex-col items-center gap-1">
        <div className="premium-surface flex h-8 w-5 items-start justify-center rounded-full p-1.5">
          <span className="mt-0.5 h-1 w-1 rounded-full bg-[#ff1a1a]" />
        </div>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className="text-white/35 transition-all duration-500 group-hover:translate-y-0.5 group-hover:text-[#ff1a1a]"
        />
      </div>
    </button>
  );
}
