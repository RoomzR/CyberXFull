import { AdvantagesGrid } from './ui/AdvantagesGrid';
import { AdvantagesSectionHeader } from './ui/AdvantagesSectionHeader';

export function Advantages() {
  return (
    <section id="advantages" className="advantages-section anchor-section">
      <div className="advantages-section__ambient" aria-hidden />
      <div className="advantages-section__grid-bg" aria-hidden />

      <div className="advantages-section__inner">
        <AdvantagesSectionHeader />
        <AdvantagesGrid />
      </div>
    </section>
  );
}
