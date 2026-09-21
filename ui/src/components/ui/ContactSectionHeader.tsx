import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { easeCyber } from '../../lib/motion';

export function ContactSectionHeader() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.header
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: easeCyber }}
      className="contact-header"
    >
      <h2 className="contact-header__title">{t('sections.contact')}</h2>
      <p className="contact-header__subtitle">{t('sections.contact_sub')}</p>
      <div className="contact-header__track">
        <div className="contact-header__beam" />
      </div>
    </motion.header>
  );
}
