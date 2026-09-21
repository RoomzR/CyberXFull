import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { easeCyber } from '../../lib/motion';

interface StatsSectionHeaderProps {
  subtitle: string;
}

export function StatsSectionHeader({ subtitle }: StatsSectionHeaderProps) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.header
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: easeCyber }}
      className="stats-header"
    >
      <h2 className="stats-header__title">
        <span className="text-cyber-white">CYBER</span>
        <span className="text-cyber-x">X</span>
        <span className="stats-header__suffix">{t('sections.stats_heading_suffix')}</span>
      </h2>

      <p className="stats-header__subtitle">{subtitle}</p>

      <div className="stats-header__track">
        <div className="stats-header__beam" />
      </div>
    </motion.header>
  );
}
