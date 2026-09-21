import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { easeCyber } from '../../lib/motion';

export function TariffsSectionHeader() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.header
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: easeCyber }}
      className="tariffs-header"
    >
      <h2 className="tariffs-header__title">{t('sections.tariffs')}</h2>
      <p className="tariffs-header__subtitle">{t('sections.tariffs_sub')}</p>
      <div className="tariffs-header__track">
        <div className="tariffs-header__beam" />
      </div>
    </motion.header>
  );
}
