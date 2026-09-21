import { motion, type Variants } from 'framer-motion';
import { Shield, TrendingDown, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CSSProperties } from 'react';
import type { Team } from '../../types/api';

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function calcWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

interface TeamCardProps {
  team: Team;
  rank: number;
  index: number;
  featured?: boolean;
  podium?: boolean;
}

function TeamCard({ team, rank, index, featured = false, podium = false }: TeamCardProps) {
  const { t } = useTranslation();
  const winRate = calcWinRate(team.wins, team.losses);
  const rankLabel = String(rank).padStart(2, '0');

  const cardClass = [
    'team-card',
    featured && 'team-card--featured',
    podium && 'team-card--podium',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.article
      custom={index}
      variants={cardVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={cardClass}
    >
      {featured && (
        <span className="team-card__league-badge">
          <Shield size={12} strokeWidth={1.5} />
          CyberX League
        </span>
      )}

      <div className="team-card__main">
        <div className="team-card__identity">
          <span
            className={`team-card__rank${featured ? ' team-card__rank--featured' : ''}${podium ? ' team-card__rank--podium' : ''}`}
          >
            #{rankLabel}
          </span>

          <div
            className="team-card__logo"
            style={{ '--team-color': team.logoColor } as CSSProperties}
          >
            <span className="team-card__tag">{team.tag}</span>
          </div>

          <div className="team-card__info">
            <h3 className={`team-card__name${featured ? ' team-card__name--featured' : ''}`}>
              {team.name}
            </h3>
            <p className="team-card__game">{team.primaryGame}</p>
          </div>
        </div>

        <div className={`team-card__stats${featured ? ' team-card__stats--featured' : ''}`}>
          <div className="team-card__stat">
            <span className="team-card__stat-label">{t('team.rating')}</span>
            <span className={`team-card__stat-value${featured ? ' team-card__stat-value--featured' : ''}`}>
              {team.rating}
            </span>
          </div>

          <div className="team-card__stat">
            <span className="team-card__stat-label">{t('team.winrate')}</span>
            <span className={`team-card__stat-value${featured ? ' team-card__stat-value--featured' : ''}`}>
              {winRate}
              <span className="team-card__stat-suffix">%</span>
            </span>
          </div>
        </div>
      </div>

      <div className="team-card__footer">
        <div className="team-card__winbar" aria-hidden>
          <span className="team-card__winbar-fill" style={{ width: `${winRate}%` }} />
        </div>

        <div className="team-card__record">
          <span className="team-card__record-item team-card__record-item--win">
            <TrendingUp size={13} strokeWidth={1.5} />
            <span className="tabular-nums">
              {team.wins}
              {t('team.wins_short')}
            </span>
          </span>
          <span className="team-card__record-item team-card__record-item--loss">
            <TrendingDown size={13} strokeWidth={1.5} />
            <span className="tabular-nums">
              {team.losses}
              {t('team.losses_short')}
            </span>
          </span>
        </div>
      </div>
    </motion.article>
  );
}

interface TeamsShowcaseProps {
  teams: Team[];
}

export function TeamsShowcase({ teams }: TeamsShowcaseProps) {
  const [leader, ...rest] = teams;

  if (teams.length === 0) return null;

  return (
    <div className="teams-showcase">
      <div className="teams-showcase__frame" aria-hidden>
        <span className="teams-showcase__corner teams-showcase__corner--tl" />
        <span className="teams-showcase__corner teams-showcase__corner--tr" />
        <span className="teams-showcase__corner teams-showcase__corner--bl" />
        <span className="teams-showcase__corner teams-showcase__corner--br" />
      </div>

      {leader && <TeamCard team={leader} rank={1} index={0} featured />}

      {rest.length > 0 && (
        <div className="teams-showcase__grid">
          {rest.map((team, i) => (
            <TeamCard
              key={team.id}
              team={team}
              rank={i + 2}
              index={i + 1}
              podium={i < 2}
            />
          ))}
        </div>
      )}
    </div>
  );
}
