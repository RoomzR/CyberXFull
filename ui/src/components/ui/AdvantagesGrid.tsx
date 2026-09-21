import { motion, type Variants } from 'framer-motion';
import {
  Cpu,
  Gamepad2,
  Radio,
  Sofa,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ITEMS = ['hardware', 'internet', 'tournaments', 'coaches', 'lounge', 'events'] as const;
export type AdvantageKey = (typeof ITEMS)[number];

const ITEM_ICONS: Record<AdvantageKey, LucideIcon> = {
  hardware: Cpu,
  internet: Radio,
  tournaments: Trophy,
  coaches: Target,
  lounge: Sofa,
  events: Gamepad2,
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

interface AdvantageCardProps {
  item: AdvantageKey;
  index: number;
  featured?: boolean;
  wide?: boolean;
}

function AdvantageCard({ item, index, featured = false, wide = false }: AdvantageCardProps) {
  const { t } = useTranslation();
  const Icon = ITEM_ICONS[item];

  return (
    <motion.article
      custom={index}
      variants={cardVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={`advantage-card${featured ? ' advantage-card--featured' : ''}${wide ? ' advantage-card--wide' : ''}`}
    >
      <span className="advantage-card__index">{String(index + 1).padStart(2, '0')}</span>

      <div className="advantage-card__icon">
        <Icon size={featured ? 20 : 17} strokeWidth={1.5} />
      </div>

      <h3 className="advantage-card__title">{t(`advantages.${item}.title`)}</h3>
      <p className="advantage-card__desc">{t(`advantages.${item}.desc`)}</p>

      <span className="advantage-card__tag">{t(`advantages.${item}.tag`)}</span>
    </motion.article>
  );
}

export function AdvantagesGrid() {
  return (
    <div className="advantages-grid">
      <AdvantageCard item="hardware" index={0} featured wide />
      <AdvantageCard item="internet" index={1} />
      <AdvantageCard item="tournaments" index={2} />
      <AdvantageCard item="coaches" index={3} />
      <AdvantageCard item="lounge" index={4} />
      <AdvantageCard item="events" index={5} />
    </div>
  );
}
