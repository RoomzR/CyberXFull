import { motion, type Variants } from 'framer-motion';
import { Crosshair, Trophy, Users, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CSSProperties } from 'react';
import type { ClubEvent } from '../../types/api';
import { Countdown } from './Countdown';

const TYPE_ICONS: Record<string, LucideIcon> = {
  tournament: Trophy,
  bootcamp: Crosshair,
  community: Users,
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function parseEventDate(date: string, locale: string) {
  const parsed = new Date(date);
  const now = Date.now();
  const eventTime = parsed.getTime();

  return {
    day: parsed.getDate(),
    month: parsed.toLocaleDateString(locale, { month: 'short' }).toUpperCase(),
    year: parsed.getFullYear(),
    isFuture: eventTime > now,
    daysDelta: Math.max(1, Math.round(Math.abs(eventTime - now) / 86_400_000)),
  };
}

interface EventCardProps {
  event: ClubEvent;
  index: number;
  featured?: boolean;
}

function EventCard({ event, index, featured = false }: EventCardProps) {
  const { t, i18n } = useTranslation();
  const meta = parseEventDate(event.date, i18n.language);
  const TypeIcon = TYPE_ICONS[event.type] ?? Users;
  const typeLabel = t(`event.${event.type}`, { defaultValue: event.type });

  return (
    <motion.article
      custom={index}
      variants={cardVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={`event-card${featured ? ' event-card--featured' : ''}${meta.isFuture ? ' event-card--upcoming' : ' event-card--past'}`}
      style={{ '--event-gradient': event.imageGradient } as CSSProperties}
    >
      <div className="event-card__gradient" aria-hidden />

      <div className="event-card__date">
        <span className="event-card__day">{meta.day}</span>
        <span className="event-card__month">{meta.month}</span>
        <span className="event-card__year">{meta.year}</span>
      </div>

      <div className="event-card__body">
        <div className="event-card__top">
          <div className="event-card__icon">
            <TypeIcon size={featured ? 18 : 15} strokeWidth={1.5} />
          </div>
          <span className="event-card__type">{typeLabel}</span>
          {meta.isFuture && (
            <span className="event-card__soon">{t('event.upcoming')}</span>
          )}
        </div>

        <h3 className={`event-card__title${featured ? ' event-card__title--featured' : ''}`}>
          {event.title}
        </h3>

        <p className="event-card__desc">{event.description}</p>

        {meta.isFuture ? (
          <Countdown targetDate={event.date} label={t('tournament.countdown')} featured={featured} />
        ) : (
          <div className="event-card__past">
            <span className="event-card__past-value">{meta.daysDelta}</span>
            <span className="event-card__past-label">{t('event.days_ago')}</span>
          </div>
        )}
      </div>
    </motion.article>
  );
}

interface EventsShowcaseProps {
  events: ClubEvent[];
}

export function EventsShowcase({ events }: EventsShowcaseProps) {
  const { i18n } = useTranslation();

  if (events.length === 0) return null;

  const featured =
    events.find((event) => parseEventDate(event.date, i18n.language).isFuture) ?? events[0];
  const rest = events.filter((event) => event.id !== featured.id);

  return (
    <div className="events-showcase">
      <EventCard event={featured} index={0} featured />

      {rest.length > 0 && (
        <div className="events-showcase__list">
          {rest.map((event, i) => (
            <EventCard key={event.id} event={event} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
