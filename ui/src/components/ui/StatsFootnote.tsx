import { useTranslation } from 'react-i18next';

const CHIPS = ['club', 'city', 'esports', 'always'] as const;

export function StatsFootnote() {
  const { t } = useTranslation();

  return (
    <div className="stats-footnote">
      <p className="stats-footnote__lead">{t('sections.stats_footnote')}</p>
      <div className="stats-footnote__chips">
        {CHIPS.map((chip, index) => (
          <span key={chip} className="stats-footnote__group">
            {index > 0 && <span className="stats-footnote__sep" aria-hidden />}
            <span className={`stats-footnote__chip${chip === 'club' ? ' stats-footnote__chip--accent' : ''}`}>
              {t(`sections.stats_chip_${chip}`)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
