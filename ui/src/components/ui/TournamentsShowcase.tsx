import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Tournament } from '../../types/api';
import { Countdown } from './Countdown';

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

interface TournamentCardProps {
  item: Tournament;
  index: number;
  featured?: boolean;
}

function TournamentCard({ item, index, featured = false }: TournamentCardProps) {
  const { t, i18n } = useTranslation();

  const statusLabel = (status: string) =>
    t(`tournament.status_${status}`, { defaultValue: status });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(i18n.language, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const showCountdown = item.status === 'registration' || item.status === 'upcoming';

  return (
    <motion.article
      custom={index}
      variants={cardVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={`tournament-card${featured ? ' tournament-card--featured' : ''}`}
    >
      {featured && (
        <span className="tournament-card__league-badge">
          <Trophy size={12} strokeWidth={1.5} />
          CyberX League
        </span>
      )}

      <div className="tournament-card__top">
        <span className={`tournament-card__status tournament-card__status--${item.status}`}>
          {statusLabel(item.status)}
        </span>
        <span className="tournament-card__game">{item.game}</span>
      </div>

      <h3 className={`tournament-card__title${featured ? ' tournament-card__title--featured' : ''}`}>
        {item.title}
      </h3>

      <p className={`tournament-card__desc${featured ? ' tournament-card__desc--featured' : ''}`}>
        {item.description}
      </p>

      {showCountdown && (
        <Countdown targetDate={item.startDate} label={t('tournament.countdown')} featured={featured} />
      )}

      <div className="tournament-card__meta">
        <div className="tournament-card__meta-item">
          <span className="tournament-card__meta-label">{t('tournament.prize')}</span>
          <span className={`tournament-card__prize${featured ? ' tournament-card__prize--featured' : ''}`}>
            {item.prizePool.toLocaleString(i18n.language)}
            <span className="tournament-card__currency">BYN</span>
          </span>
        </div>
        <div className="tournament-card__meta-item">
          <span className="tournament-card__meta-label">{t('tournament.date')}</span>
          <span className="tournament-card__date">{formatDate(item.startDate)}</span>
        </div>
      </div>

      <div className={`tournament-card__actions${featured ? ' tournament-card__actions--featured' : ''}`}>
        <a
          href={item.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`tournament-card__cta tournament-card__cta--primary${featured ? ' tournament-card__cta--featured' : ''}`}
        >
          <span className="tournament-card__cta-label">{t('tournament.register')}</span>
          <ArrowRight size={14} strokeWidth={1.5} />
        </a>
        <a
          href={item.rulesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tournament-card__cta"
        >
          <span className="tournament-card__cta-label">{t('tournament.rules')}</span>
        </a>
      </div>
    </motion.article>
  );
}

interface TournamentsShowcaseProps {
  tournaments: Tournament[];
}

export function TournamentsShowcase({ tournaments }: TournamentsShowcaseProps) {
  const [featured, ...rest] = tournaments;

  if (tournaments.length === 0) return null;

  return (
    <div className="tournaments-showcase">
      <div className="tournaments-showcase__frame" aria-hidden>
        <span className="tournaments-showcase__corner tournaments-showcase__corner--tl" />
        <span className="tournaments-showcase__corner tournaments-showcase__corner--tr" />
        <span className="tournaments-showcase__corner tournaments-showcase__corner--bl" />
        <span className="tournaments-showcase__corner tournaments-showcase__corner--br" />
      </div>

      {featured && <TournamentCard item={featured} index={0} featured />}

      {rest.length > 0 && (
        <div className="tournaments-showcase__grid">
          {rest.map((item, i) => (
            <TournamentCard key={item.id} item={item} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
