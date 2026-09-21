import { motion, type Variants } from 'framer-motion';
import { Shield, Trophy, Users, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatedCounter } from './AnimatedCounter';
import { StatsFootnote } from './StatsFootnote';

type StatKey = 'tournaments' | 'teams' | 'players';

interface StatItem {
  key: StatKey;
  value: number;
  icon: LucideIcon;
  featured?: boolean;
}

/** Масштаб клуба — без дублирования live-метрик из Hero (32 ПК, дисциплины, 24/7) */
const STATS: StatItem[] = [
  { key: 'tournaments', value: 48, icon: Trophy },
  { key: 'teams', value: 10, icon: Shield },
  { key: 'players', value: 1200, icon: Users, featured: true },
];

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function StatSparkBars() {
  const heights = [42, 68, 55, 82, 48, 74, 61, 88, 52, 70];

  return (
    <div className="stats-card__spark" aria-hidden>
      {heights.map((h, i) => (
        <span
          key={i}
          className="stats-card__spark-bar"
          style={
            {
              '--h': `${h}%`,
              '--delay': `${i * 0.08}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function StatsShowcase() {
  const { t } = useTranslation();

  return (
    <div className="stats-showcase">
      <div className="stats-showcase__frame" aria-hidden>
        <span className="stats-showcase__corner stats-showcase__corner--tl" />
        <span className="stats-showcase__corner stats-showcase__corner--tr" />
        <span className="stats-showcase__corner stats-showcase__corner--bl" />
        <span className="stats-showcase__corner stats-showcase__corner--br" />
        <div className="stats-showcase__glow" />
      </div>

      {STATS.map((stat, index) => {
        const Icon = stat.icon;
        const featured = stat.featured ?? false;

        return (
          <motion.article
            key={stat.key}
            custom={index}
            variants={cardVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className={`stats-card stats-card--${stat.key}${featured ? ' stats-card--featured' : ''}`}
          >
            <div className="stats-card__top">
              <div className="stats-card__icon">
                <Icon size={featured ? 22 : 18} strokeWidth={1.5} />
              </div>
              <span className="stats-card__index">{String(index + 1).padStart(2, '0')}</span>
            </div>

            <AnimatedCounter
              value={stat.value}
              suffix="+"
              accent={featured}
              className={`stats-card__value${featured ? ' stats-card__value--featured' : ''}`}
            />

            <p className="stats-card__label">{t(`stats.${stat.key}`)}</p>

            {featured && (
              <>
                <StatSparkBars />
                <span className="stats-card__tag">{t('sections.stats_community')}</span>
              </>
            )}
          </motion.article>
        );
      })}

      <StatsFootnote />
    </div>
  );
}
