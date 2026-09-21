import { motion, type Variants } from 'framer-motion';
import { Cpu, Gauge, Trophy, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ABOUT_BADGES, ABOUT_GALLERY, ABOUT_PILLARS } from '../../data/aboutGallery';
import type { ClubInfo } from '../../types/api';

const PILLAR_ICONS: Record<(typeof ABOUT_PILLARS)[number]['icon'], LucideIcon> = {
  cpu: Cpu,
  gauge: Gauge,
  trophy: Trophy,
};
const itemVariant: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function isHighlightToken(part: string): boolean {
  return /^(RTX\s?\d{4}|\d{3,4}\s?Hz|24\/7|TOP\s?\d+|#\d+|CS2|Valorant|Dota\s?2|League of Legends|Fortnite)$/i.test(
    part.trim(),
  );
}

function highlightManifestText(text: string) {
  const pattern =
    /(RTX\s?\d{4}|\d{3,4}\s?Hz|24\/7|TOP\s?\d+|#\d+|CS2|Valorant|Dota\s?2|League of Legends|Fortnite)/gi;

  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (isHighlightToken(part)) {
      return (
        <span key={`${part}-${index}`} className="about-manifest__chip">
          {part}
        </span>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

interface AboutShowcaseProps {
  club: ClubInfo;
}

function GallerySlot({
  src,
  label,
  wide,
  index,
}: {
  src: string;
  label: string;
  wide?: boolean;
  index: number;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <motion.div
      custom={index}
      variants={itemVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={`about-gallery__slot${wide ? ' about-gallery__slot--wide' : ''}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={label}
          className="about-gallery__img"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="about-gallery__media" aria-hidden />
      )}
      <span className="about-gallery__label">{label}</span>
    </motion.div>
  );
}

export function AboutShowcase({ club }: AboutShowcaseProps) {
  const { t } = useTranslation();

  const pillars = ABOUT_PILLARS.map((pillar) => ({
    icon: PILLAR_ICONS[pillar.icon],
    value: pillar.value,
    label: 'useCity' in pillar && pillar.useCity ? club.city : t(pillar.labelKey),
  }));
  return (
    <div className="about-showcase">
      <div className="about-showcase__frame" aria-hidden>
        <span className="about-showcase__corner about-showcase__corner--tl" />
        <span className="about-showcase__corner about-showcase__corner--tr" />
        <span className="about-showcase__corner about-showcase__corner--bl" />
        <span className="about-showcase__corner about-showcase__corner--br" />
      </div>

      <div className="about-showcase__grid">
        <div className="about-gallery">
          {ABOUT_GALLERY.map((item, index) => (
            <GallerySlot
              key={`${item.src}-${index}`}
              src={item.src}
              label={item.label}
              wide={item.wide}
              index={index}
            />
          ))}
        </div>
        <div className="about-content">
          <motion.div
            custom={0}
            variants={itemVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="about-manifest__badges"
          >
            {ABOUT_BADGES.map((badge) => (              <span key={badge} className="about-manifest__badge">
                {badge}
              </span>
            ))}
          </motion.div>

          <motion.p
            custom={1}
            variants={itemVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="about-manifest__text"
          >
            {highlightManifestText(club.about)}
          </motion.p>

          <motion.p
            custom={2}
            variants={itemVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="about-manifest__tagline"
          >
            {club.tagline}
          </motion.p>

          <div className="about-pillars">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;

              return (
                <motion.article
                  key={pillar.label}
                  custom={index + 3}
                  variants={itemVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                  className="about-pillar"
                >
                  <div className="about-pillar__icon">
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <span className="about-pillar__value">{pillar.value}</span>
                  <span className="about-pillar__label">{pillar.label}</span>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
