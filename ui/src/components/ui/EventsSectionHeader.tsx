import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { easeCyber } from '../../lib/motion';

export function EventsSectionHeader() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.header
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: easeCyber }}
      className="events-header"
    >
      <h2 className="events-header__title">{t('sections.events')}</h2>
      <p className="events-header__subtitle">{t('sections.events_sub')}</p>
      <div className="events-header__track">
        <div className="events-header__beam" />
      </div>
    </motion.header>
  );
}
