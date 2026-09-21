import type { LivePlayer } from '../../services/api';
import { hltvRating2, hltvRating3, ratingColor } from './hltvRating';
import { getWeapon, weaponColor } from './weapons';
import { formatMoney, splitTeams } from './liveUtils';

interface Props {
  players: LivePlayer[];
  ctName: string;
  tName: string;
  scoreCt: number;
  scoreT: number;
  round: number;
  roundPhase?: string;
  bombState?: string;
  ratingVersion?: 2 | 3;
}

const ROSTER_SIZE = 5;

function padRoster(list: LivePlayer[]): (LivePlayer | null)[] {
  const rows: (LivePlayer | null)[] = [...list];
  while (rows.length < ROSTER_SIZE) rows.push(null);
  return rows.slice(0, ROSTER_SIZE);
}

function PlayerCard({ p, side, rounds, ratingVersion }: {
  p: LivePlayer; side: 'ct' | 't'; rounds: number; ratingVersion: 2 | 3;
}) {
  const w = getWeapon(p.weapon);
  const adr = p.damage && rounds > 0 ? p.damage / Math.max(rounds, 1) : undefined;
  const r2 = p.rating2 ?? hltvRating2(p.kills, p.deaths, p.assists, rounds, p.mvps, p.score, adr);
  const r3 = p.rating3 ?? hltvRating3(p.kills, p.deaths, p.assists, rounds, p.mvps, p.score, adr);
  const rating = ratingVersion === 3 ? r3 : r2;
  const diff = p.kills - p.deaths;

  return (
    <div className={`roster-card roster-card--${side}${p.alive ? '' : ' roster-card--dead'}`}>
      <div className="roster-card__head">
        <div className={`roster-card__avatar roster-card__avatar--${side}`}>
          {p.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="roster-card__identity">
          <div className="roster-card__name" title={p.name}>{p.name}</div>
          <div className="roster-card__sub">
            {p.alive ? (
              <>
                <span className={`roster-card__wpn roster-card__wpn--${w.type}`}>{w.short}</span>
                {(p.hasHelmet || p.armor >= 100) && <span className="roster-card__helm">⛨</span>}
              </>
            ) : (
              <span className="roster-card__dead-tag">DEAD</span>
            )}
          </div>
        </div>
        <div className="roster-card__rating" style={{ color: ratingColor(rating) }}>
          {rating.toFixed(2)}
        </div>
      </div>

      <div className="roster-card__live">
        {p.alive ? (
          <>
            <div className="roster-card__hp-row">
              <span className="roster-card__hp-label">HP</span>
              <div className="roster-card__hp-bar">
                <div className="roster-card__hp-fill" style={{
                  width: `${Math.max(0, Math.min(100, p.health))}%`,
                  background: p.health > 50 ? '#3dd68c' : p.health > 25 ? '#f5a623' : '#ff4757',
                }} />
              </div>
              <span className="roster-card__hp-num">{p.health}</span>
              {p.armor > 0 && <span className="roster-card__armor">🛡{p.armor}</span>}
            </div>
            {p.money != null && p.money > 0 && (
              <div className="roster-card__money">{formatMoney(p.money)}</div>
            )}
          </>
        ) : (
          <div className="roster-card__ghost-hp" />
        )}
      </div>

      <div className="roster-card__stats">
        <span><b>{p.kills}</b>/{p.deaths}/{p.assists}</span>
        <span className={diff >= 0 ? 'roster-card__diff--pos' : 'roster-card__diff--neg'}>
          {diff >= 0 ? '+' : ''}{diff}
        </span>
        <span>{p.hsPct}% HS</span>
        {adr != null && <span>{adr.toFixed(0)} ADR</span>}
      </div>
    </div>
  );
}

function EmptySlot({ side }: { side: 'ct' | 't' }) {
  return (
    <div className={`roster-card roster-card--empty roster-card--${side}`}>
      <div className="roster-card__empty-text">— свободный слот —</div>
      <div className="roster-card__empty-hint">GSI не видит игрока</div>
    </div>
  );
}

function StatsTable({ players, side, rounds, ratingVersion, showLive }: {
  players: LivePlayer[]; side: 'ct' | 't'; rounds: number; ratingVersion: 2 | 3; showLive: boolean;
}) {
  const sorted = [...players].sort((a, b) => b.kills - a.kills || b.score - a.score);

  return (
    <table className="hltv-table hltv-table--roster">
      <thead>
        <tr>
          <th>#</th>
          <th>Player</th>
          {showLive && <th>Wpn</th>}
          <th>K</th><th>D</th><th>A</th><th>+/-</th>
          {showLive && <th>HP</th>}
          {showLive && <th>$</th>}
          <th>ADR</th>
          <th>HS%</th>
          <th>R{ratingVersion}</th>
        </tr>
      </thead>
      <tbody>
        {sorted.length === 0 ? (
          <tr><td colSpan={showLive ? 12 : 9} className="hltv-table__empty-row">Нет данных GSI</td></tr>
        ) : sorted.map((p, i) => {
          const adr = p.damage && rounds > 0 ? p.damage / Math.max(rounds, 1) : undefined;
          const r = ratingVersion === 3
            ? (p.rating3 ?? hltvRating3(p.kills, p.deaths, p.assists, rounds, p.mvps, p.score, adr))
            : (p.rating2 ?? hltvRating2(p.kills, p.deaths, p.assists, rounds, p.mvps, p.score, adr));
          const w = getWeapon(p.weapon);
          const diff = p.kills - p.deaths;

          return (
            <tr key={p.steamId} className={!p.alive && showLive ? 'hltv-table__dead' : ''}>
              <td className="hltv-table__rank">{i + 1}</td>
              <td>
                <span className={`hltv-table__name hltv-table__name--${side}`}>{p.name}</span>
              </td>
              {showLive && (
                <td>
                  {p.alive ? (
                    <span className="hltv-table__wpn" style={{ color: weaponColor(w.type), borderColor: weaponColor(w.type) }}>
                      {w.short}
                    </span>
                  ) : (
                    <span className="hltv-table__dead-icon">☠</span>
                  )}
                </td>
              )}
              <td className="hltv-table__k">{p.kills}</td>
              <td>{p.deaths}</td>
              <td>{p.assists}</td>
              <td style={{ color: diff >= 0 ? '#3dd68c' : '#ff4757', fontWeight: 700 }}>
                {diff >= 0 ? '+' : ''}{diff}
              </td>
              {showLive && (
                <td>
                  {p.alive ? (
                    <span className="hltv-table__hp">{p.health}{p.armor > 0 ? `/${p.armor}` : ''}</span>
                  ) : (
                    <span className="hltv-table__dead-label">DEAD</span>
                  )}
                </td>
              )}
              {showLive && (
                <td className="hltv-table__money">{p.money != null ? formatMoney(p.money) : '—'}</td>
              )}
              <td>{adr != null ? adr.toFixed(0) : '—'}</td>
              <td>{p.hsPct}%</td>
              <td className="hltv-table__rating" style={{ color: ratingColor(r) }}>{r.toFixed(2)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TeamRoster({ players, side, name, rounds, ratingVersion }: {
  players: LivePlayer[]; side: 'ct' | 't'; name: string; rounds: number; ratingVersion: 2 | 3;
}) {
  const roster = padRoster(players);
  const alive = players.filter(p => p.alive).length;

  return (
    <div className={`team-roster team-roster--${side}`}>
      <div className="team-roster__head">
        <div>
          <div className="team-roster__name">{name}</div>
          <div className="team-roster__meta">{players.length} игроков · {alive} alive</div>
        </div>
        <div className={`team-roster__side-tag team-roster__side-tag--${side}`}>
          {side.toUpperCase()}
        </div>
      </div>
      <div className="team-roster__grid">
        {roster.map((p, i) => p
          ? <PlayerCard key={p.steamId} p={p} side={side} rounds={rounds} ratingVersion={ratingVersion} />
          : <EmptySlot key={`empty-${side}-${i}`} side={side} />
        )}
      </div>
    </div>
  );
}

export function HltvLiveBoard({
  players, ctName, tName, scoreCt, scoreT, round, roundPhase, bombState, ratingVersion = 2,
}: Props) {
  const { ct, t, unk } = splitTeams(players);
  const allKnown = [...ct, ...t];
  const aliveCt = ct.filter(p => p.alive).length;
  const aliveT = t.filter(p => p.alive).length;
  const rounds = Math.max(round, 3);
  const showGsiHint = allKnown.length < 10;

  return (
    <div className="hltv-board hltv-board--v3">
      <div className="hltv-board__scorebar">
        <div className="hltv-board__team hltv-board__team--ct">
          <div className="hltv-board__team-label">{ctName}</div>
          <div className="hltv-board__alive">{aliveCt}/{ct.length || ROSTER_SIZE} alive</div>
        </div>
        <div className="hltv-board__center">
          <div className="hltv-board__scores">
            <span className="hltv-board__score hltv-board__score--ct">{scoreCt}</span>
            <span className="hltv-board__colon">:</span>
            <span className="hltv-board__score hltv-board__score--t">{scoreT}</span>
          </div>
          <div className="hltv-board__round">
            Round {round}
            {roundPhase && roundPhase !== 'live' && ` · ${roundPhase}`}
            {bombState && bombState !== 'undefined' && (
              <span className="hltv-board__bomb"> · 💣 {bombState}</span>
            )}
          </div>
        </div>
        <div className="hltv-board__team hltv-board__team--t">
          <div className="hltv-board__alive">{aliveT}/{t.length || ROSTER_SIZE} alive</div>
          <div className="hltv-board__team-label">{tName}</div>
        </div>
      </div>

      {showGsiHint && (
        <div className="hltv-board__gsi-hint">
          GSI видит <strong>{allKnown.length}</strong> игроков
          {unk.length > 0 && ` (+${unk.length} без команды)`}.
          {' '}Боты в GSI не приходят — нужен <strong>dedicated server</strong> с cfg на сервере и живые игроки.
          {allKnown.length <= 1 && (
            <> Сейчас только ты в GSI. Друзья не видны, пока у них нет того же cfg на ПК, или пока cfg не стоит на <strong>dedicated server</strong> (allplayers).</>
          )}
          {allKnown.length > 1 && allKnown.length < 10 && (
            <> Частичный roster — игроки появляются, когда у них установлен cfg и идёт матч.</>
          )}
        </div>
      )}

      <div className="hltv-board__rosters">
        <TeamRoster players={ct} side="ct" name={ctName} rounds={rounds} ratingVersion={ratingVersion} />
        <TeamRoster players={t} side="t" name={tName} rounds={rounds} ratingVersion={ratingVersion} />
      </div>

      <div className="hltv-board__tables">
        <div className="hltv-board__table-wrap">
          <div className="hltv-board__table-head hltv-board__table-head--ct">Статистика · {ctName}</div>
          <StatsTable players={ct} side="ct" rounds={rounds} ratingVersion={ratingVersion} showLive />
        </div>
        <div className="hltv-board__table-wrap">
          <div className="hltv-board__table-head hltv-board__table-head--t">Статистика · {tName}</div>
          <StatsTable players={t} side="t" rounds={rounds} ratingVersion={ratingVersion} showLive />
        </div>
      </div>
    </div>
  );
}

export function HltvMatchBoard(props: Omit<Props, 'scoreCt' | 'scoreT' | 'roundPhase' | 'bombState'> & { showLive?: boolean }) {
  const { players, ctName, tName, round, ratingVersion = 2, showLive = false } = props;
  const { ct, t } = splitTeams(players);
  const rounds = Math.max(round, 3);

  return (
    <div className="hltv-board hltv-board--match">
      <div className="hltv-board__tables">
        <div className="hltv-board__table-wrap">
          <div className="hltv-board__table-head hltv-board__table-head--ct">{ctName}</div>
          <StatsTable players={ct} side="ct" rounds={rounds} ratingVersion={ratingVersion} showLive={showLive} />
        </div>
        <div className="hltv-board__table-wrap">
          <div className="hltv-board__table-head hltv-board__table-head--t">{tName}</div>
          <StatsTable players={t} side="t" rounds={rounds} ratingVersion={ratingVersion} showLive={showLive} />
        </div>
      </div>
    </div>
  );
}
