import { TariffsGrid } from './ui/TariffsGrid';
import { TariffsSectionHeader } from './ui/TariffsSectionHeader';

export function Tariffs() {
  return (
    <section id="tariffs" className="tariffs-section anchor-section">
      <div className="tariffs-section__ambient" aria-hidden />

      <div className="tariffs-section__inner">
        <TariffsSectionHeader />
        <TariffsGrid />
      </div>
    </section>
  );
}
