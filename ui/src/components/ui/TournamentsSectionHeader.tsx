import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { easeCyber } from '../../lib/motion';

export function TournamentsSectionHeader() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.header
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: easeCyber }}
      className="tournaments-header"
    >
      <h2 className="tournaments-header__title">{t('sections.tournaments')}</h2>
      <p className="tournaments-header__subtitle">{t('sections.tournaments_sub')}</p>
      <div className="tournaments-header__track">
        <div className="tournaments-header__beam" />
      </div>
    </motion.header>
  );
}
