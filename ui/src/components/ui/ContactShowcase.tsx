import { motion, type Variants } from 'framer-motion';
import { MapPin, MessageCircle, Phone, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { ClubInfo } from '../../types/api';
import { ClubSocialLinks } from './ClubSocialLinks';

const MAP_EMBED_URL =
  'https://www.openstreetmap.org/export/embed.html?bbox=30.975%2C52.428%2C30.995%2C52.442&layer=mapnik&marker=52.435%2C30.985';

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

interface ContactCardProps {
  icon: LucideIcon;
  label: string;
  index: number;
  children: ReactNode;
}

function ContactCard({ icon: Icon, label, index, children }: ContactCardProps) {
  return (
    <motion.article
      custom={index}
      variants={cardVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="contact-card"
    >
      <div className="contact-card__icon">
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div className="contact-card__body">
        <span className="contact-card__label">{label}</span>
        {children}
      </div>
    </motion.article>
  );
}

interface ContactShowcaseProps {
  club: ClubInfo;
}

export function ContactShowcase({ club }: ContactShowcaseProps) {
  const { t } = useTranslation();

  return (
    <div className="contact-showcase">
      <div className="contact-showcase__frame" aria-hidden>
        <span className="contact-showcase__corner contact-showcase__corner--tl" />
        <span className="contact-showcase__corner contact-showcase__corner--tr" />
        <span className="contact-showcase__corner contact-showcase__corner--bl" />
        <span className="contact-showcase__corner contact-showcase__corner--br" />
      </div>

      <div className="contact-showcase__grid">
        <div className="contact-showcase__info">
          <ContactCard icon={Phone} label={t('contact.phone')} index={0}>
            <a href={`tel:${club.phone.replace(/\s/g, '')}`} className="contact-card__phone">
              {club.phone}
            </a>
          </ContactCard>

          <ContactCard icon={MapPin} label={t('contact.address')} index={1}>
            <p className="contact-card__city">
              {club.country}, {club.city}
            </p>
            <p className="contact-card__address">{club.address}</p>
          </ContactCard>

          <ContactCard icon={MessageCircle} label={t('contact.social')} index={2}>
            <ClubSocialLinks club={club} variant="contact" />
          </ContactCard>
        </div>

        <motion.div
          custom={3}
          variants={cardVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="contact-map"
        >
          <iframe
            title="CyberX Gomel location"
            src={MAP_EMBED_URL}
            loading="lazy"
            className="contact-map__iframe"
          />
          <div className="contact-map__overlay" aria-hidden />
          <div className="contact-map__scanline" aria-hidden />
        </motion.div>
      </div>
    </div>
  );
}
