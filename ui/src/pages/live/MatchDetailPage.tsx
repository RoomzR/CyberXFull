import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StatsLayout } from '../../components/live/StatsLayout';
import { MapHero } from '../../components/live/MatchCards';
import { HltvMatchBoard } from '../../components/live/HltvLiveBoard';
import { formatDateTime } from '../../components/live/liveUtils';
import { liveApi, type MatchDetail } from '../../services/api';

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<MatchDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    liveApi.match(Number(id)).then(setMatch).catch(() => {});
  }, [id]);

  if (!match) {
    return (
      <StatsLayout audience="guest" active="matches">
        <div style={{ textAlign: 'center', padding: 80, color: '#555' }}>LOADING...</div>
      </StatsLayout>
    );
  }

  const ctWon = match.scoreCt > match.scoreT;
  const tWon = match.scoreT > match.scoreCt;
  const winner = ctWon ? match.teamCtName : tWon ? match.teamTName : 'Draw';

  return (
    <StatsLayout audience="guest" active="matches">
      <div style={{ marginBottom: 16 }}>
        <Link to="/live/matches" style={{ fontSize: 11, color: '#666', textDecoration: 'none', letterSpacing: '0.1em' }}>
          ← МАТЧИ
        </Link>
      </div>

      <MapHero
        mapName={match.mapName}
        mode={match.mode}
        scoreCt={match.scoreCt}
        scoreT={match.scoreT}
        teamCtName={match.teamCtName}
        teamTName={match.teamTName}
        server={match.server}
        subtitle={`${match.totalRounds} rounds · ${winner} wins`}
      />

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, padding: '12px 16px', flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em', marginBottom: 4 }}>STARTED</div>
          <div style={{ fontSize: 12, color: '#aaa' }}>{formatDateTime(match.startedAt)}</div>
        </div>
        {match.endedAt && (
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, padding: '12px 16px', flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em', marginBottom: 4 }}>ENDED</div>
            <div style={{ fontSize: 12, color: '#aaa' }}>{formatDateTime(match.endedAt)}</div>
          </div>
        )}
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, padding: '12px 16px', flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em', marginBottom: 4 }}>WINNER</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#22c55e' }}>{winner}</div>
        </div>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, padding: '12px 16px', flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em', marginBottom: 4 }}>STATUS</div>
          <div style={{ fontSize: 12, color: '#aaa', textTransform: 'uppercase' }}>{match.status}</div>
        </div>
      </div>

      <div className="live-stats__section-title">
        <h2>Player Stats</h2>
        <span className="live-stats__section-meta">{match.players.length} players</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <HltvMatchBoard
          players={match.players.map(p => ({
            steamId: p.playerName,
            name: p.playerName,
            team: p.team,
            kills: p.kills,
            deaths: p.deaths,
            assists: p.assists,
            mvps: p.mvps,
            score: p.score,
            headshots: p.headshots,
            health: 0,
            armor: 0,
            alive: false,
            kd: p.kd,
            hsPct: p.hsPct,
            rating2: p.rating2,
            rating3: p.rating3,
          }))}
          ctName={match.teamCtName}
          tName={match.teamTName}
          round={Math.max(match.totalRounds, 3)}
          ratingVersion={2}
        />
      </div>
    </StatsLayout>
  );
}
