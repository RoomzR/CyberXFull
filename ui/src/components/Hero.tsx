import { motion } from 'framer-motion';
import { Clock, Monitor, Trophy } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ClubInfo } from '../types/api';
import { HeroBackdrop } from './effects/HeroBackdrop';
import { fadeUp, staggerContainer } from '../lib/motion';
import { BrandTitle } from './ui/BrandTitle';
import { HeroCommandDeck } from './ui/HeroCommandDeck';
import { HeroLocationStrip } from './ui/HeroLocationStrip';
import { ScrollHint } from './ui/ScrollHint';

interface HeroProps {
  club: ClubInfo;
}

const PC_COUNT = 32;
const ABOUT_SECTION_ID = 'about';

export function Hero({ club }: HeroProps) {
  const { t } = useTranslation();

  const scrollToAbout = useCallback(() => {
    document.getElementById(ABOUT_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const heroMetrics = [
    {
      id: 'pcs',
      type: 'counter' as const,
      value: PC_COUNT,
      label: t('hero.stations'),
      icon: Monitor,
      featured: true,
    },
    {
      id: 'games',
      type: 'counter' as const,
      value: club.supportedGames.length,
      label: t('hero.disciplines'),
      icon: Trophy,
    },
    {
      id: 'online',
      type: 'text' as const,
      value: '24/7',
      label: t('hero.online'),
      icon: Clock,
    },
  ];

  return (
    <section
      id="home"
      data-snap="hero"
      aria-label="CyberX"
      className="hero-section snap-section anchor-section"
    >
      <HeroBackdrop />

      <div className="hero-shell">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="hero-grid"
        >
          <div className="hero-zone-top" aria-hidden>
            <div className="hero-top-accent" />
          </div>

          <div className="hero-zone-center">
            <motion.div variants={fadeUp} className="w-full">
              <BrandTitle />
            </motion.div>

            <motion.div variants={fadeUp} className="mt-5 w-full md:mt-6">
              <HeroLocationStrip city={club.city} country={club.country} />
            </motion.div>

            <motion.div variants={fadeUp} className="mt-6 w-full md:mt-8">
              <HeroCommandDeck metrics={heroMetrics} />
            </motion.div>
          </div>

          <div className="hero-zone-bottom" aria-hidden />
        </motion.div>
      </div>

      <ScrollHint onClick={scrollToAbout} />
    </section>
  );
}
