import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { easeCyber } from '../../lib/motion';

export function AboutSectionHeader() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.header
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: easeCyber }}
      className="about-header"
    >
      <h2 className="about-header__title">
        <span className="text-cyber-white">CYBER</span>
        <span className="text-cyber-x">X</span>
        <span className="about-header__suffix">{t('sections.about_heading_suffix')}</span>
      </h2>
      <p className="about-header__subtitle">{t('sections.about_sub')}</p>
      <div className="about-header__track">
        <div className="about-header__beam" />
      </div>
    </motion.header>
  );
}
