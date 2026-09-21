import { motion, type Variants } from 'framer-motion';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fadeUp } from '../../lib/motion';
import { AnimatedCounter } from './AnimatedCounter';

export interface HeroMetric {
  id: string;
  type: 'counter' | 'text';
  value: number | string;
  label: string;
  icon: LucideIcon;
  featured?: boolean;
}

interface HeroCommandDeckProps {
  metrics: HeroMetric[];
}

const deckItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function HeroCommandDeck({ metrics }: HeroCommandDeckProps) {
  const { t } = useTranslation();

  return (
    <div className="hero-deck">
      <div className="hero-deck__glow" aria-hidden />
      <div className="hero-deck__corners" aria-hidden>
        <span className="hero-deck__corner hero-deck__corner--tl" />
        <span className="hero-deck__corner hero-deck__corner--tr" />
        <span className="hero-deck__corner hero-deck__corner--bl" />
        <span className="hero-deck__corner hero-deck__corner--br" />
      </div>

      <p className="hero-deck__live-label">{t('hero.deck_live')}</p>

      <div className="hero-deck__stats">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const featured = metric.featured ?? index === 0;

          return (
            <motion.div
              key={metric.id}
              custom={index}
              variants={deckItem}
              initial="hidden"
              animate="visible"
              className={`hero-deck__stat${featured ? ' hero-deck__stat--featured' : ''}`}
            >
              <span className="hero-deck__index">{String(index + 1).padStart(2, '0')}</span>
              <div className="hero-deck__icon">
                <Icon size={15} strokeWidth={1.5} />
              </div>
              {metric.type === 'counter' ? (
                <AnimatedCounter
                  value={metric.value as number}
                  accent={featured}
                  className={`hero-deck__value${featured ? ' hero-deck__value--featured' : ''}`}
                />
              ) : (
                <span
                  className={`counter-value hero-deck__value${featured ? ' hero-deck__value--featured counter-value--accent' : ''}`}
                >
                  {metric.value}
                </span>
              )}
              <span className="hero-deck__label">{metric.label}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="hero-deck__divider-line" aria-hidden />

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="hero-deck__actions">
        <a href="#tournaments" className="hero-deck__cta hero-deck__cta--primary">
          <span className="hero-deck__cta-inner">
            <span className="hero-deck__cta-label">{t('hero.cta_tournaments')}</span>
            <ArrowRight size={15} strokeWidth={1.5} className="hero-deck__cta-arrow" />
          </span>
        </a>
        <a href="#tariffs" className="hero-deck__cta">
          <span className="hero-deck__cta-inner">
            <span className="hero-deck__cta-label">{t('hero.cta_tariffs')}</span>
          </span>
        </a>
        <a href="#contact" className="hero-deck__cta">
          <span className="hero-deck__cta-inner">
            <span className="hero-deck__cta-label">{t('hero.cta_contact')}</span>
          </span>
        </a>
      </motion.div>
    </div>
  );
}
