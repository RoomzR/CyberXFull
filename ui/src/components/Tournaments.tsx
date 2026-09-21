import { TournamentsSectionHeader } from './ui/TournamentsSectionHeader';
import { TournamentsShowcase } from './ui/TournamentsShowcase';
import type { Tournament } from '../types/api';

interface TournamentsProps {
  tournaments: Tournament[];
}

export function Tournaments({ tournaments }: TournamentsProps) {
  return (
    <section id="tournaments" className="tournaments-section anchor-section">
      <div className="tournaments-section__ambient" aria-hidden />
      <div className="tournaments-section__grid-bg" aria-hidden />

      <div className="tournaments-section__inner">
        <TournamentsSectionHeader />
        <TournamentsShowcase tournaments={tournaments} />
      </div>
    </section>
  );
}
