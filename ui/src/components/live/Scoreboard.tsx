import type { LivePlayer } from '../../services/api';
import { hltvRating2, hltvRating3, ratingColor } from './hltvRating';
import { WeaponBadge } from './weapons';

interface ScoreboardProps {
  players: LivePlayer[];
  ctName: string;
  tName: string;
  showLive?: boolean;
  rounds?: number;
  ratingVersion?: 2 | 3;
}

function AliveStrip({ players, ctName, tName }: { players: LivePlayer[]; ctName: string; tName: string }) {
  const ct = players.filter(p => p.team === 'CT' || p.team === 'Counter-Terrorists');
  const tt = players.filter(p => p.team === 'T' || p.team === 'Terrorists');
  const aliveCt = ct.filter(p => p.alive).length;
  const aliveT  = tt.filter(p => p.alive).length;

  return (
    <div className="alive-strip">
      <div className="alive-strip__side alive-strip__side--ct">
        <span className="alive-strip__label">{ctName}</span>
        <div className="alive-strip__dots">
          {ct.map(p => (
            <span key={p.steamId} className={`alive-dot alive-dot--${p.alive ? 'alive' : 'dead'}`} title={p.name} />
          ))}
        </div>
        <span className="alive-strip__count">{aliveCt}/{ct.length}</span>
      </div>
      <div className="alive-strip__vs">VS</div>
      <div className="alive-strip__side alive-strip__side--t">
        <span className="alive-strip__count">{aliveT}/{tt.length}</span>
        <div className="alive-strip__dots">
          {tt.map(p => (
            <span key={p.steamId} className={`alive-dot alive-dot--${p.alive ? 'alive' : 'dead'}`} title={p.name} />
          ))}
        </div>
        <span className="alive-strip__label">{tName}</span>
      </div>
    </div>
  );
}

function TeamTable({ players, label, side, showLive, rounds = 1, ratingVersion = 2 }: {
  players: LivePlayer[];
  label: string;
  side: 'ct' | 't';
  showLive?: boolean;
  rounds?: number;
  ratingVersion?: 2 | 3;
}) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const topKills = Math.max(...sorted.map(p => p.kills), 0);

  return (
    <div className="live-scoreboard">
      <div className={`live-scoreboard__header live-scoreboard__header--${side}`}>{label}</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            {showLive && <th>Status</th>}
            {showLive && <th>Wpn</th>}
            <th>K</th>
            <th>D</th>
            <th>A</th>
            <th>+/−</th>
            <th>HS%</th>
            <th>Rating {ratingVersion}.0</th>
            <th>MVP</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={showLive ? 11 : 9} className="live-scoreboard__empty">—</td></tr>
          ) : sorted.map((p, idx) => {
            const r2 = p.rating2 ?? hltvRating2(p.kills, p.deaths, p.assists, rounds, p.mvps, p.score);
            const r3 = p.rating3 ?? hltvRating3(p.kills, p.deaths, p.assists, rounds, p.mvps, p.score);
            const rating = ratingVersion === 3 ? r3 : r2;
            const diff = p.kills - p.deaths;

            return (
              <tr key={p.steamId} className={!p.alive && showLive ? 'player-row--dead' : undefined}>
                <td className="player-row__rank">{idx + 1}</td>
                <td>
                  <div className="live-scoreboard__player">
                    <span className={`player-avatar player-avatar--${side}${!p.alive && showLive ? ' player-avatar--dead' : ''}`}>
                      {p.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="player-row__name-block">
                      <span className="player-row__name">{p.name}</span>
                      {showLive && p.alive && (
                        <div className="player-row__hp">
                          <div className="live-scoreboard__hp-bar">
                            <div className="live-scoreboard__hp-fill" style={{
                              width: `${p.health}%`,
                              background: p.health > 50 ? '#22c55e' : p.health > 20 ? '#eab308' : '#ef4444',
                            }} />
                          </div>
                          <span className="player-row__hp-text">{p.health}</span>
                          {p.armor > 0 && (
                            <span className={`player-row__armor${p.armor >= 100 ? ' player-row__armor--helm' : ''}`} title={`Armor ${p.armor}`}>
                              {p.armor >= 100 ? '⛨' : '◆'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {p.kills === topKills && topKills > 0 && (
                      <span className="live-scoreboard__mvp" title="Top fragger">★</span>
                    )}
                  </div>
                </td>
                {showLive && (
                  <td>
                    <span className={`status-pill status-pill--${p.alive ? 'alive' : 'dead'}`}>
                      {p.alive ? 'ALIVE' : 'DEAD'}
                    </span>
                  </td>
                )}
                {showLive && (
                  <td><WeaponBadge weapon={p.weapon} dead={!p.alive} /></td>
                )}
                <td className="stat-k">{p.kills}</td>
                <td className="stat-d">{p.deaths}</td>
                <td className="stat-a">{p.assists}</td>
                <td className="stat-diff" style={{ color: diff >= 0 ? '#22c55e' : '#ef4444' }}>
                  {diff >= 0 ? '+' : ''}{diff}
                </td>
                <td>{p.hsPct}%</td>
                <td className="stat-rating" style={{ color: ratingColor(rating), fontWeight: 800 }}>
                  {rating.toFixed(2)}
                </td>
                <td className="stat-mvp">{p.mvps || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function LiveScoreboard({ players, ctName, tName, showLive = true, rounds = 1, ratingVersion = 2 }: ScoreboardProps) {
  const ct = players.filter(p => p.team === 'CT' || p.team === 'Counter-Terrorists');
  const tt = players.filter(p => p.team === 'T' || p.team === 'Terrorists');

  return (
    <div>
      {showLive && players.length > 0 && (
        <AliveStrip players={players} ctName={ctName} tName={tName} />
      )}
      <div className="live-scoreboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: showLive ? 12 : 0 }}>
        <TeamTable players={ct} label={ctName} side="ct" showLive={showLive} rounds={rounds} ratingVersion={ratingVersion} />
        <TeamTable players={tt} label={tName} side="t" showLive={showLive} rounds={rounds} ratingVersion={ratingVersion} />
      </div>
    </div>
  );
}

interface StaticPlayer {
  playerName: string;
  team: string;
  kills: number;
  deaths: number;
  assists: number;
  mvps: number;
  score: number;
  headshots: number;
  kd: number;
  hsPct: number;
  rating2?: number;
  rating3?: number;
}

export function MatchScoreboard({ players, ctName, tName, rounds = 1, ratingVersion = 2 }: {
  players: StaticPlayer[];
  ctName: string;
  tName: string;
  rounds?: number;
  ratingVersion?: 2 | 3;
}) {
  const mapped: LivePlayer[] = players.map((p, i) => ({
    steamId: p.playerName + i,
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
  }));

  return (
    <LiveScoreboard
      players={mapped}
      ctName={ctName}
      tName={tName}
      showLive={false}
      rounds={rounds}
      ratingVersion={ratingVersion}
    />
  );
}
