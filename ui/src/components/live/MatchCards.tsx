import { Link } from 'react-router-dom';
import type { LiveServerOverview } from '../../services/api';
import { formatTime, mapTheme } from './liveUtils';

function LiveDot({ online }: { online: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: online ? '#22c55e' : '#555' }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: online ? '#22c55e' : '#444',
        boxShadow: online ? '0 0 6px #22c55e' : 'none',
      }} />
      {online ? 'LIVE' : 'OFFLINE'}
    </span>
  );
}

export function LiveMatchCard({ s, featured, guest }: { s: LiveServerOverview; featured?: boolean; guest?: boolean }) {
  const m = s.match;
  const theme = m ? mapTheme(m.mapName) : null;

  return (
    <Link
      to={`/live/${s.id}`}
      className={`live-match-card${s.isOnline && m ? ' live-match-card--live' : ''}`}
      style={featured ? { gridColumn: '1 / -1' } : undefined}
    >
      {theme && m ? (
        <div
          className="live-match-card__map"
          style={{ background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)` }}
        >
          <div className="live-match-card__map-name">{theme.label}</div>
          <LiveDot online={s.isOnline} />
        </div>
      ) : (
        <div className="live-match-card__map" style={{ background: '#252525', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="live-match-card__map-name" style={{ fontSize: 13, color: '#666' }}>{s.name}</div>
          <LiveDot online={s.isOnline} />
        </div>
      )}

      <div className="live-match-card__body">
        <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 10 }}>
          {s.name}
          {s.linkedPc && <span style={{ color: '#555' }}> · PC #{s.linkedPc}{s.zone ? ` · ${s.zone}` : ''}</span>}
        </div>

        {m ? (
          <>
            <div className="live-match-card__teams">
              <div className="live-match-card__team">
                <div className="live-match-card__team-name live-match-card__team-name--ct">{m.teamCtName}</div>
                <div className="live-match-card__score live-match-card__score--ct">{m.scoreCt}</div>
              </div>
              <div className="live-match-card__vs">:</div>
              <div className="live-match-card__team" style={{ textAlign: 'right' }}>
                <div className="live-match-card__team-name live-match-card__team-name--t">{m.teamTName}</div>
                <div className="live-match-card__score live-match-card__score--t">{m.scoreT}</div>
              </div>
            </div>
            <div className="live-match-card__meta">
              <span>Round {m.round} · {m.mode}</span>
              <span>{m.playerCount} players</span>
              {m.bombState && m.bombState !== 'undefined' && (
                <span style={{ color: '#ef4444' }}>BOMB {m.bombState.toUpperCase()}</span>
              )}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0', color: '#555', fontSize: 11 }}>
            {guest
              ? (s.isOnline ? 'Ожидание начала матча' : 'Ожидание трансляции')
              : (s.isOnline ? 'Waiting for match...' : 'GSI not connected')}
          </div>
        )}
      </div>
    </Link>
  );
}

export function MatchResultRow({ m }: {
  m: {
    id: number;
    mapName: string;
    scoreCt: number;
    scoreT: number;
    teamCtName: string;
    teamTName: string;
    totalRounds: number;
    startedAt: string;
    endedAt?: string;
    server: string;
    winner: string;
  };
}) {
  const ctWon = m.scoreCt > m.scoreT;
  const tWon = m.scoreT > m.scoreCt;
  const theme = mapTheme(m.mapName);

  return (
    <Link to={`/live/match/${m.id}`} className="live-result-row">
      <div className="live-result-row__map">{theme.label}</div>
      <div className="live-result-row__teams">
        <span className={`live-result-row__team${ctWon ? ' live-result-row__team--winner' : ' live-result-row__team--loser'}`}>
          {m.teamCtName}
        </span>
        <div className="live-result-row__scorebox">
          <span className={ctWon ? 'live-result-row__score--win' : 'live-result-row__score--lose'}>{m.scoreCt}</span>
          <span style={{ color: '#444' }}>:</span>
          <span className={tWon ? 'live-result-row__score--win' : 'live-result-row__score--lose'}>{m.scoreT}</span>
        </div>
        <span className={`live-result-row__team${tWon ? ' live-result-row__team--winner' : ' live-result-row__team--loser'}`} style={{ textAlign: 'right' }}>
          {m.teamTName}
        </span>
      </div>
      <div className="live-result-row__date">
        {m.totalRounds} rnd
        <br />
        {new Date(m.endedAt ?? m.startedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
        <div style={{ fontSize: 9, color: '#444', marginTop: 2 }}>{m.server}</div>
      </div>
    </Link>
  );
}

export function MapHero({ mapName, mode, round, roundPhase, bombState, scoreCt, scoreT, teamCtName, teamTName, server, subtitle }: {
  mapName: string;
  mode?: string;
  round?: number;
  roundPhase?: string;
  bombState?: string;
  scoreCt: number;
  scoreT: number;
  teamCtName: string;
  teamTName: string;
  server?: string;
  subtitle?: string;
}) {
  const theme = mapTheme(mapName);

  return (
    <div className="live-map-hero">
      <div className="live-map-hero__bg" style={{ background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 70%, #121212 100%)` }}>
        <div>
          <div className="live-map-hero__title">{theme.label}</div>
          <div className="live-map-hero__meta">
            {server && <span>{server} · </span>}
            {mode && <span>{mode}</span>}
            {round !== undefined && <span> · Round {round}</span>}
            {roundPhase && <span> · {roundPhase}</span>}
            {bombState && bombState !== 'undefined' && (
              <span style={{ color: '#fca5a5' }}> · BOMB {bombState.toUpperCase()}</span>
            )}
            {subtitle && <span> · {subtitle}</span>}
          </div>
        </div>
        <div className="live-map-hero__scores">
          <div className="live-map-hero__score-block">
            <div className="live-map-hero__score-label" style={{ color: '#5b9bd5' }}>{teamCtName}</div>
            <div className="live-map-hero__score-num" style={{ color: '#5b9bd5' }}>{scoreCt}</div>
          </div>
          <div className="live-map-hero__colon">:</div>
          <div className="live-map-hero__score-block">
            <div className="live-map-hero__score-label" style={{ color: '#e8a838' }}>{teamTName}</div>
            <div className="live-map-hero__score-num" style={{ color: '#e8a838' }}>{scoreT}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { formatTime };
