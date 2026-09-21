import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { easeCyber } from '../../lib/motion';

export function FaqSectionHeader() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.header
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: easeCyber }}
      className="faq-header"
    >
      <h2 className="faq-header__title">{t('sections.faq')}</h2>
      <p className="faq-header__subtitle">{t('sections.faq_sub')}</p>
      <div className="faq-header__track">
        <div className="faq-header__beam" />
      </div>
    </motion.header>
  );
}
