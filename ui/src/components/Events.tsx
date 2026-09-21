import type { ClubEvent } from '../types/api';
import { EventsSectionHeader } from './ui/EventsSectionHeader';
import { EventsShowcase } from './ui/EventsShowcase';

interface EventsProps {
  events: ClubEvent[];
}

export function Events({ events }: EventsProps) {
  return (
    <section id="events" className="events-section anchor-section">
      <div className="events-section__ambient" aria-hidden />
      <div className="events-section__grid-bg" aria-hidden />

      <div className="events-section__inner">
        <EventsSectionHeader />
        <EventsShowcase events={events} />
      </div>
    </section>
  );
}
