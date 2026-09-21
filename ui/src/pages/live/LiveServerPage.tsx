import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StatsLayout } from '../../components/live/StatsLayout';
import { HltvLiveBoard } from '../../components/live/HltvLiveBoard';
import { VetoPanel } from '../../components/live/VetoPanel';
import { formatTime } from '../../components/live/liveUtils';
import { useIsAdmin } from '../../hooks/useRole';
import { liveApi, type LiveServerDetail, type LivePlayer, type VetoSeries } from '../../services/api';

export function LiveServerPage() {
  const { id } = useParams<{ id: string }>();
  const isAdmin = useIsAdmin();
  const [data, setData]         = useState<LiveServerDetail | null>(null);
  const [veto, setVeto]         = useState<VetoSeries | null>(null);
  const [ratingVer, setRatingVer] = useState<2 | 3>(2);

  const load = useCallback(async () => {
    if (!id) return;
    const sid = Number(id);
    try {
      const [server, vetoData] = await Promise.all([
        liveApi.server(sid),
        liveApi.vetoActive(sid).catch(() => null),
      ]);
      setData(server);
      setVeto(vetoData);
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [load]);

  const m = data?.match;
  const players: LivePlayer[] = m?.players ?? [];

  return (
    <StatsLayout audience="guest" active="live" liveCount={data?.isOnline && m ? 1 : 0}>
      <div className="hltv-page-bar">
        <Link to="/live" className="hltv-page-bar__back">← ЭФИР</Link>
        <div className="hltv-page-bar__title">{data?.name ?? '...'}</div>
        <div className="hltv-page-bar__rating-toggle">
          {([2, 3] as const).map(v => (
            <button
              key={v}
              type="button"
              className={`hltv-rating-btn${ratingVer === v ? ' hltv-rating-btn--active' : ''}`}
              onClick={() => setRatingVer(v)}
            >
              Rating {v}.0
            </button>
          ))}
        </div>
      </div>

      {!data ? (
        <div className="hltv-loading">LOADING...</div>
      ) : (
        <>
          {veto ? (
            <section className="hltv-section">
              <VetoPanel series={veto} />
            </section>
          ) : !isAdmin ? (
            <div className="hltv-no-veto hltv-no-veto--guest">
              Карты серии определяются перед матчем
            </div>
          ) : (
            <div className="hltv-no-veto">
              Map veto не настроен · <Link to="/live/control">Управление → Map Veto</Link>
            </div>
          )}

          {!m ? (
            <div className="hltv-empty-match">
              <div className="hltv-empty-match__title">{data.name}</div>
              <p>
                {data.isOnline
                  ? 'Матч скоро начнётся — оставайся на странице'
                  : 'Трансляция пока недоступна'}
              </p>
              {isAdmin && !data.isOnline && (
                <div className="hltv-empty-match__hint hltv-empty-match__hint--admin">
                  {data.lastGsiAt ? (
                    <div>Последний GSI: {new Date(data.lastGsiAt).toLocaleString('ru-RU')}</div>
                  ) : (
                    <div>API ещё не получал POST от CS2.</div>
                  )}
                  <ol>
                    <li>Cfg в <code>game\csgo\cfg\gamestate_integration_cyberx.cfg</code></li>
                    <li>Полный перезапуск CS2 после установки cfg</li>
                    <li>Зайди в матч · dedicated: cfg на сервере, uri = IP API</li>
                  </ol>
                  <div className="hltv-empty-match__actions">
                    <Link to="/live/control/setup" className="hltv-btn hltv-btn--primary">Инструкция CFG</Link>
                    <Link to="/live/control/gsi-test" className="hltv-btn">GSI Test</Link>
                    <Link to="/live/control" className="hltv-btn">Управление</Link>
                  </div>
                </div>
              )}
              {!isAdmin && (
                <div className="hltv-empty-match__actions">
                  <Link to="/live" className="hltv-btn hltv-btn--primary">← К эфиру</Link>
                </div>
              )}
            </div>
          ) : (
            <section className="hltv-section">
              <HltvLiveBoard
                players={players}
                ctName={m.teamCtName}
                tName={m.teamTName}
                scoreCt={m.scoreCt}
                scoreT={m.scoreT}
                round={m.round}
                roundPhase={m.roundPhase}
                bombState={m.bombState}
                ratingVersion={ratingVer}
              />
              <div className="hltv-meta">
                Обновлено {formatTime(m.updatedAt)}
                {isAdmin && data.lastGsiAt && ` · GSI ${formatTime(data.lastGsiAt)}`}
                · Rating {ratingVer}.0
              </div>
            </section>
          )}
        </>
      )}
    </StatsLayout>
  );
}
