import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { easeCyber } from '../../lib/motion';

export function AdvantagesSectionHeader() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.header
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: easeCyber }}
      className="advantages-header"
    >
      <h2 className="advantages-header__title">
        <span className="text-cyber-white">CYBER</span>
        <span className="text-cyber-x">X</span>
        <span className="advantages-header__suffix">{t('sections.advantages_heading_suffix')}</span>
      </h2>
      <p className="advantages-header__subtitle">{t('sections.advantages_sub')}</p>
      <div className="advantages-header__track">
        <div className="advantages-header__beam" />
      </div>
    </motion.header>
  );
}
