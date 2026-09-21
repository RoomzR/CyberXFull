import type { FaqItem } from '../types/api';
import { FaqSectionHeader } from './ui/FaqSectionHeader';
import { FaqShowcase } from './ui/FaqShowcase';

interface FaqProps {
  items: FaqItem[];
}

export function Faq({ items }: FaqProps) {
  return (
    <section id="faq" className="faq-section anchor-section">
      <div className="faq-section__ambient" aria-hidden />
      <div className="faq-section__grid-bg" aria-hidden />

      <div className="faq-section__inner">
        <FaqSectionHeader />
        <FaqShowcase items={items} />
      </div>
    </section>
  );
}
