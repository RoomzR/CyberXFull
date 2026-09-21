import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { easeCyber } from '../../lib/motion';

export function TeamsSectionHeader() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.header
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: easeCyber }}
      className="teams-header"
    >
      <h2 className="teams-header__title">{t('sections.teams')}</h2>
      <p className="teams-header__subtitle">{t('sections.teams_sub')}</p>
      <div className="teams-header__track">
        <div className="teams-header__beam" />
      </div>
    </motion.header>
  );
}
