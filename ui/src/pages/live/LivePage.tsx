import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { StatsLayout } from '../../components/live/StatsLayout';
import { LiveBroadcastHero } from '../../components/live/LiveBroadcastHero';
import { LiveMatchCard, MatchResultRow } from '../../components/live/MatchCards';
import { VetoPanel } from '../../components/live/VetoPanel';
import { liveApi, type LiveServerOverview, type MatchSummary, type VetoSeries } from '../../services/api';

export function LivePage() {
  const [servers, setServers] = useState<LiveServerOverview[]>([]);
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [veto, setVeto]       = useState<VetoSeries | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, m, v] = await Promise.all([
        liveApi.overview(),
        liveApi.matches(20),
        liveApi.vetoActive().catch(() => null),
      ]);
      setServers(s);
      setMatches(m);
      setVeto(v);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const liveServers = servers.filter(s => s.isOnline && s.match);
  const liveCount = liveServers.length;
  const featured = liveServers[0] ?? servers.find(s => s.match) ?? null;
  const otherServers = featured
    ? servers.filter(s => s.id !== featured.id)
    : servers;

  return (
    <StatsLayout audience="guest" active="live" liveCount={liveCount}>
      {loading ? (
        <div className="live-stats__loading">Загрузка эфира…</div>
      ) : (
        <>
          {featured?.match && liveCount > 0 && (
            <section className="live-stats__hero-section">
              <LiveBroadcastHero server={featured} />
            </section>
          )}

          <div className="live-stats__grid-2">
            <div>
              {veto && (
                <section className="live-stats__block">
                  <div className="live-stats__section-title">
                    <h2>Map Veto</h2>
                    <Link to={`/live/${veto.serverId ?? 1}`} className="live-stats__section-link">
                      К матчу →
                    </Link>
                  </div>
                  <VetoPanel series={veto} />
                </section>
              )}

              {featured && !liveCount && (
                <section className="live-stats__block">
                  <div className="live-stats__section-title">
                    <h2>Сервер</h2>
                  </div>
                  <LiveMatchCard s={featured} featured guest />
                </section>
              )}

              <section className="live-stats__block">
                <div className="live-stats__section-title">
                  <h2>{liveCount > 0 ? 'Все серверы' : 'Серверы клуба'}</h2>
                  <span className="live-stats__section-meta">{servers.length}</span>
                </div>
                {servers.length === 0 ? (
                  <div className="live-stats__empty-panel">
                    <div className="live-stats__empty-title">Трансляции скоро</div>
                    <p className="live-stats__empty-text">
                      Сейчас нет активных серверов. Загляни позже — здесь появятся live-матчи и статистика.
                    </p>
                  </div>
                ) : (
                  <div className="live-stats__server-grid">
                    {otherServers.map(s => (
                      <LiveMatchCard key={s.id} s={s} guest />
                    ))}
                  </div>
                )}
              </section>

              <section className="live-stats__block">
                <div className="live-stats__section-title">
                  <h2>Последние матчи</h2>
                  <Link to="/live/matches" className="live-stats__section-link">
                    Все матчи →
                  </Link>
                </div>
                <div className="live-stats__results-panel">
                  {matches.length === 0 ? (
                    <div className="live-stats__empty-inline">Пока нет завершённых матчей</div>
                  ) : (
                    matches.slice(0, 10).map(m => <MatchResultRow key={m.id} m={m} />)
                  )}
                </div>
              </section>
            </div>

            <aside className="live-stats__sidebar">
              {liveServers.length > 0 && (
                <div className="live-stats__sidebar-box live-stats__sidebar-box--live">
                  <h3>Сейчас в эфире</h3>
                  {liveServers.map(s => (
                    <Link key={s.id} to={`/live/${s.id}`} className="live-stats__sidebar-live-row">
                      <span className="live-stats__sidebar-live-dot" />
                      <span className="live-stats__sidebar-live-name">{s.name}</span>
                      {s.match && (
                        <span className="live-stats__sidebar-live-score">
                          {s.match.scoreCt}:{s.match.scoreT}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              <div className="live-stats__sidebar-box">
                <h3>Статистика</h3>
                <div className="live-stats__mini-stats">
                  {[
                    { label: 'Серверы', val: servers.length },
                    { label: 'Live', val: liveCount },
                    { label: 'Матчи', val: matches.length },
                    { label: 'Online', val: servers.filter(s => s.isOnline).length },
                  ].map(x => (
                    <div key={x.label} className="live-stats__mini-stat">
                      <div className="live-stats__mini-stat-val">{x.val}</div>
                      <div className="live-stats__mini-stat-label">{x.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </StatsLayout>
  );
}
