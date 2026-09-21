import { Link } from 'react-router-dom';
import type { LiveServerOverview } from '../../services/api';
import { mapLabel, mapTheme } from './liveUtils';

export function LiveBroadcastHero({ server }: { server: LiveServerOverview }) {
  const m = server.match;
  if (!m) return null;

  const theme = mapTheme(m.mapName);
  const aliveTotal = (m.aliveCt ?? 0) + (m.aliveT ?? 0);

  return (
    <Link to={`/live/${server.id}`} className="live-broadcast-hero">
      <div
        className="live-broadcast-hero__bg"
        style={{ background: `linear-gradient(120deg, ${theme.from} 0%, #0a0a12 55%, ${theme.to}33 100%)` }}
      />
      <div className="live-broadcast-hero__scan" aria-hidden />
      <div className="live-broadcast-hero__content">
        <div className="live-broadcast-hero__tag">
          <span className="live-broadcast-hero__dot" />
          В ЭФИРЕ
        </div>
        <div className="live-broadcast-hero__map">{mapLabel(m.mapName)}</div>
        <div className="live-broadcast-hero__server">{server.name}</div>
        <div className="live-broadcast-hero__scoreline">
          <div className="live-broadcast-hero__team live-broadcast-hero__team--ct">
            <span className="live-broadcast-hero__team-name">{m.teamCtName}</span>
            <span className="live-broadcast-hero__score">{m.scoreCt}</span>
          </div>
          <span className="live-broadcast-hero__vs">:</span>
          <div className="live-broadcast-hero__team live-broadcast-hero__team--t">
            <span className="live-broadcast-hero__score">{m.scoreT}</span>
            <span className="live-broadcast-hero__team-name">{m.teamTName}</span>
          </div>
        </div>
        <div className="live-broadcast-hero__meta">
          Раунд {m.round}
          {aliveTotal > 0 && ` · ${aliveTotal} в игре`}
          {m.bombState && m.bombState !== 'undefined' && (
            <span className="live-broadcast-hero__bomb"> · BOMB {m.bombState.toUpperCase()}</span>
          )}
        </div>
      </div>
      <div className="live-broadcast-hero__cta">Смотреть трансляцию →</div>
    </Link>
  );
}
