import { StatsSectionHeader } from './ui/StatsSectionHeader';
import { StatsShowcase } from './ui/StatsShowcase';
import { useTranslation } from 'react-i18next';

export function Stats() {
  const { t } = useTranslation();

  return (
    <section
      id="stats"
      className="stats-section snap-section anchor-section"
    >
      <div className="stats-section__ambient" aria-hidden />
      <div className="stats-section__grid-bg" aria-hidden />

      <div className="stats-section__inner">
        <StatsSectionHeader subtitle={t('sections.stats_sub')} />
        <StatsShowcase />
      </div>
    </section>
  );
}
