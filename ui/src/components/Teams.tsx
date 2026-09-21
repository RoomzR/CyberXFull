import type { Team } from '../types/api';
import { TeamsSectionHeader } from './ui/TeamsSectionHeader';
import { TeamsShowcase } from './ui/TeamsShowcase';

interface TeamsProps {
  teams: Team[];
}

export function Teams({ teams }: TeamsProps) {
  return (
    <section id="teams" className="teams-section anchor-section">
      <div className="teams-section__ambient" aria-hidden />
      <div className="teams-section__grid-bg" aria-hidden />

      <div className="teams-section__inner">
        <TeamsSectionHeader />
        <TeamsShowcase teams={teams} />
      </div>
    </section>
  );
}
