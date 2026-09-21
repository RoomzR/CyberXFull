import { useEffect, useState, useCallback, useRef, type MouseEvent } from 'react';

import { Link } from 'react-router-dom';

import {

  adminLiveApi, adminVetoApi, adminServersApi,

  type AdminLiveOverview, type VetoSeries, type GameServerRow, type GsiConfigResponse,

} from '../../services/api';

import { VetoPanel } from '../../components/live/VetoPanel';

import { GsiSetupGuide } from '../../components/live/GsiSetupGuide';
import { GsiCfgModal } from '../../components/live/GsiCfgModal';

import { mapLabel, mapTheme } from '../../components/live/liveUtils';

import {

  VETO_FORMATS, getVetoSteps, getFormatDef, getTotalSteps,

  formatStatusLabel, type VetoFormatId,

} from '../../components/live/vetoFormats';

import { AdminServersPanel } from './AdminServersPanel';

import '../../styles/admin-live.css';

function formatServerClearMsg(
  name: string,
  r: { deleted?: number; finalized?: number; gsiCleared?: boolean; blockedMinutes?: number },
) {
  const db = r.deleted ?? r.finalized ?? 0;
  const parts: string[] = [];
  if (db > 0) parts.push(`в БД: ${db}`);
  if (r.gsiCleared) parts.push('экран live сброшен');
  if (r.blockedMinutes) parts.push(`GSI пауза ${r.blockedMinutes} мин`);
  if (parts.length === 0) return `«${name}»: live уже был пуст`;
  return `«${name}»: ${parts.join(' · ')}`;
}



const MAP_POOL = [

  'de_overpass', 'de_nuke', 'de_dust2', 'de_inferno',

  'de_ancient', 'de_mirage', 'de_anubis',

];



function AdminTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {

  return (

    <button type="button" onClick={onClick}

      className={`admin-live__tab${active ? ' admin-live__tab--active' : ''}`}>

      {label}

    </button>

  );

}



function AdminVetoSection({
  servers,
  pendingSeries,
  onPendingConsumed,
}: {
  servers: GameServerRow[];
  pendingSeries?: VetoSeries | null;
  onPendingConsumed?: () => void;
}) {

  const [series, setSeries]       = useState<VetoSeries[]>([]);

  const [selected, setSelected]   = useState<VetoSeries | null>(null);

  const [loading, setLoading]     = useState(true);

  const [form, setForm]           = useState({ team1: '', team2: '', serverId: '', format: 'bo3' as VetoFormatId });

  const [sideNote, setSideNote]   = useState('');

  const [showCreate, setShowCreate] = useState(false);

  const selectedIdRef = useRef<number | null>(null);

  selectedIdRef.current = selected?.id ?? null;



  const load = useCallback(async () => {

    setLoading(true);

    try {

      const list = await adminVetoApi.list();

      setSeries(list);

      const id = selectedIdRef.current;

      if (id) {

        const updated = list.find(s => s.id === id);

        setSelected(updated ?? null);

      }

    } finally { setLoading(false); }

  }, []);



  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!pendingSeries) return;
    setSelected(pendingSeries);
    setShowCreate(false);
    onPendingConsumed?.();
  }, [pendingSeries, onPendingConsumed]);



  const create = async () => {

    if (!form.team1.trim() || !form.team2.trim()) return;

    const s = await adminVetoApi.create({

      team1Name: form.team1,

      team2Name: form.team2,

      serverId: form.serverId ? Number(form.serverId) : undefined,

      format: form.format,

    });

    setForm({ team1: '', team2: '', serverId: '', format: 'bo3' });

    setShowCreate(false);

    setSelected(s);

    load();

  };



  const fmtDef = selected ? getFormatDef(selected.format) : null;

  const steps = selected ? getVetoSteps(selected.format) : [];

  const totalSteps = selected ? (selected.totalSteps || getTotalSteps(selected.format)) : 0;

  const nextStep = selected ? steps[selected.log.length] ?? null : null;



  const availableMaps = selected

    ? MAP_POOL.filter(m => !selected.mapPool.some(p => p.mapName === m && p.status !== 'available'))

    : MAP_POOL;



  const addAction = async (mapName: string) => {

    if (!selected || !nextStep) return;

    const updated = await adminVetoApi.action(selected.id, {

      action: nextStep.action,

      mapName,

      team: nextStep.team,

      sideNote: sideNote.trim() || undefined,

    });

    setSideNote('');

    setSelected(updated);

    load();

  };



  const teamName = (team: 'team1' | 'team2') =>

    team === 'team1' ? (selected?.team1Name ?? 'Team 1') : (selected?.team2Name ?? 'Team 2');



  if (loading && series.length === 0) {

    return <div className="py-16 text-center text-[#475569] animate-pulse tracking-widest text-sm">ЗАГРУЗКА VETO...</div>;

  }



  return (

    <div className="space-y-6">

      <div className="admin-section-head">

        <div>

          <h3>Map Veto</h3>

          <p>Создай серию, выбери формат (BO1–BO5) и пройди шаги банов/пиков. Результат сразу виден на /live.</p>

        </div>

        <button type="button" onClick={() => setShowCreate(v => !v)} className="admin-btn-primary">

          {showCreate ? 'Скрыть форму' : '+ Новая серия'}

        </button>

      </div>



      {showCreate && (

        <div className="admin-create-card space-y-5">

          <div className="admin-create-card__title">Новая серия veto</div>



          <div>

            <label className="text-[9px] font-bold uppercase tracking-widest text-[#64748b] block mb-3">Формат матча</label>

            <div className="format-picker">

              {VETO_FORMATS.map(f => (

                <button key={f.id} type="button" onClick={() => setForm(x => ({ ...x, format: f.id }))}

                  className={`format-card${form.format === f.id ? ' format-card--active' : ''}`}>

                  <span className="format-card__maps">{f.mapsPlayed} map{f.mapsPlayed > 1 ? 's' : ''}</span>

                  <div className="format-card__short">{f.short}</div>

                  <div className="format-card__label">{f.label}</div>

                  <div className="format-card__desc">{f.description}</div>

                </button>

              ))}

            </div>

          </div>



          <div className="grid sm:grid-cols-2 gap-4">

            <div className="admin-field">

              <label>Команда 1</label>

              <input placeholder="CyberX Alpha" value={form.team1}

                onChange={e => setForm(f => ({ ...f, team1: e.target.value }))} />

            </div>

            <div className="admin-field">

              <label>Команда 2</label>

              <input placeholder="CyberX Beta" value={form.team2}

                onChange={e => setForm(f => ({ ...f, team2: e.target.value }))} />

            </div>

            <div className="admin-field sm:col-span-2">

              <label>Сервер (привязка к /live)</label>

              {servers.length === 0 ? (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  Нет серверов — сначала создай во вкладке «Серверы GSI» (можно сразу с veto)
                </div>
              ) : (
              <select value={form.serverId} onChange={e => setForm(f => ({ ...f, serverId: e.target.value }))}>

                <option value="">— Выбери сервер —</option>

                {servers.map(s => <option key={s.id} value={s.id}>{s.name}{s.ipAddress ? ` · ${s.ipAddress}` : ''}</option>)}

              </select>
              )}

            </div>

          </div>



          <button type="button" onClick={create} className="admin-btn-primary w-full sm:w-auto">

            Создать {getFormatDef(form.format).short} серию

          </button>

        </div>

      )}



      <div className="grid lg:grid-cols-[280px_1fr] gap-6">

        <div className="veto-series-list">

          <div className="veto-series-list__head">Серии · {series.length}</div>

          {series.length === 0 ? (

            <div className="p-8 text-center text-[#64748b] text-sm">Нет серий — создай первую</div>

          ) : series.map(s => {

            const fd = getFormatDef(s.format);

            const total = s.totalSteps || getTotalSteps(s.format);

            return (

              <button key={s.id} type="button" onClick={() => setSelected(s)}

                className={`veto-series-item${selected?.id === s.id ? ' veto-series-item--active' : ''}`}>

                <div className="veto-series-item__teams">{s.team1Name} vs {s.team2Name}</div>

                <div className="veto-series-item__meta">

                  <span className="veto-format-badge" style={{ fontSize: 9, padding: '2px 6px' }}>{fd.short}</span>

                  <span className={`veto-series-item__status veto-series-item__status--${s.status}`}>

                    {formatStatusLabel(s.status)}

                  </span>

                  <span className="text-[10px] text-[#475569]">{s.log.length}/{total}</span>

                </div>

              </button>

            );

          })}

        </div>



        <div className="space-y-4 min-w-0">

          {!selected ? (

            <div className="rounded-xl border border-dashed border-white/10 p-16 text-center">

              <div className="text-3xl mb-3 opacity-30">🗺</div>

              <div className="text-sm text-[#64748b]">Выбери серию слева или создай новую</div>

            </div>

          ) : (

            <>

              <div className="admin-toolbar">

                <Link to={`/live/${selected.serverId ?? 1}`} target="_blank"

                  className="admin-btn-ghost" style={{ color: '#ff5500', borderColor: 'rgba(255,85,0,0.3)' }}>

                  Preview на /live →

                </Link>

                {selected.status !== 'finished' && (

                  <>

                    <button type="button" onClick={async () => { await adminVetoApi.finish(selected.id); load(); }}

                      className="admin-btn-ghost" style={{ color: '#4ade80', borderColor: 'rgba(34,197,94,0.3)' }}>

                      Завершить серию

                    </button>

                    <button type="button" onClick={async () => { await adminVetoApi.reset(selected.id); load(); }}

                      className="admin-btn-ghost">

                      Сбросить шаги

                    </button>

                  </>

                )}

                <button type="button"

                  onClick={async () => { if (confirm('Удалить серию?')) { await adminVetoApi.remove(selected.id); setSelected(null); load(); } }}

                  className="admin-btn-ghost" style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>

                  Удалить

                </button>

              </div>



              {selected.status === 'veto' && nextStep && (

                <div className="veto-wizard">

                  <div className="veto-wizard__head">

                    <div>

                      <div className="veto-wizard__step-num">ШАГ {selected.log.length + 1} / {totalSteps}</div>

                      <div className="veto-wizard__step-title">

                        {nextStep.label}

                        {fmtDef && <span style={{ color: '#64748b', fontWeight: 600, marginLeft: 8 }}>({fmtDef.short})</span>}

                      </div>

                    </div>

                    <div className={`veto-wizard__team-badge veto-wizard__team-badge--${nextStep.team}`}>

                      <span className={`veto-wizard__action-tag veto-wizard__action-tag--${nextStep.action}`}>

                        {nextStep.action.toUpperCase()}

                      </span>

                      {teamName(nextStep.team)}

                    </div>

                  </div>

                  <div className="veto-wizard__body">

                    {nextStep.hint && <div className="veto-wizard__hint">{nextStep.hint}</div>}

                    {nextStep.action === 'pick' && (

                      <div className="admin-field mb-4">

                        <label>Стартовая сторона CT (опционально)</label>

                        <input value={sideNote} onChange={e => setSideNote(e.target.value)}

                          placeholder={`${teamName(nextStep.team)} starts CT`} />

                      </div>

                    )}

                    <div className="veto-map-grid">

                      {availableMaps.map(map => {

                        const theme = mapTheme(map);

                        return (

                          <button key={map} type="button" onClick={() => addAction(map)} className="veto-map-btn">

                            <div className="veto-map-btn__thumb"

                              style={{ background: `linear-gradient(160deg, ${theme.from}, ${theme.to})` }} />

                            <span className="veto-map-btn__name">{theme.label}</span>

                          </button>

                        );

                      })}

                    </div>

                    {nextStep.action === 'decider' && availableMaps.length === 1 && (

                      <button type="button" onClick={() => addAction(availableMaps[0])}

                        className="mt-4 text-[11px] text-[#ffd166] hover:underline font-bold">

                        Авто-decider: {mapLabel(availableMaps[0])}

                      </button>

                    )}

                  </div>

                </div>

              )}



              <VetoPanel series={selected} />

            </>

          )}

        </div>

      </div>

    </div>

  );

}



function AdminMatchesSection() {
  const [matches, setMatches] = useState<Awaited<ReturnType<typeof adminLiveApi.matches>>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'live' | 'completed'>('all');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setMatches(await adminLiveApi.matches(100));
    } catch (e) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Ошибка загрузки' });
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const finish = async (id: number) => {
    if (!confirm('Завершить матч? Счёт сохранится, live-статистика на /live сбросится.')) return;
    setBusyId(id);
    setMsg(null);
    try {
      await adminLiveApi.finishMatch(id);
      setMsg({ type: 'ok', text: `Матч #${id} завершён` });
      setMatches(prev => prev.map(m => m.id === id ? { ...m, status: 'completed' } : m));
      await load(true);
    } catch (e) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Не удалось завершить' });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number, e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Удалить матч и всю статистику безвозвратно?')) return;
    setBusyId(id);
    setMsg(null);
    try {
      await adminLiveApi.deleteMatch(id);
      setMatches(prev => prev.filter(m => m.id !== id));
      setMsg({ type: 'ok', text: `Матч #${id} удалён` });
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Не удалось удалить' });
    } finally {
      setBusyId(null);
    }
  };

  const resetServer = async (serverId: number, serverName: string) => {
    if (!confirm(`Сбросить live на сервере «${serverName}»? Все live-матчи будут завершены.`)) return;
    setMsg(null);
    try {
      const r = await adminLiveApi.resetServerLive(serverId);
      setMsg({ type: 'ok', text: `Live сброшен · завершено матчей: ${r.finalized}` });
      await load(true);
    } catch (e) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Ошибка сброса live' });
    }
  };

  const filtered = matches.filter(m =>
    filter === 'all' ? true : filter === 'live' ? m.status === 'live' : m.status === 'completed',
  );

  const liveCount = matches.filter(m => m.status === 'live').length;

  if (loading) return <div className="py-16 text-center text-[#475569] animate-pulse tracking-widest text-sm">ЗАГРУЗКА...</div>;

  return (
    <div className="space-y-5">
      <div className="admin-section-head">
        <div>
          <h3>История матчей</h3>
          <p>Завершай live-матчи или удаляй ошибочные записи. Live-матчи из GSI можно принудительно закрыть.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {(['all', 'live', 'completed'] as const).map(f => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={`admin-live__tab${filter === f ? ' admin-live__tab--active' : ''}`}
              style={{ padding: '6px 12px', fontSize: 9 }}>
              {f === 'all' ? 'Все' : f === 'live' ? `Live (${liveCount})` : 'Completed'}
            </button>
          ))}
          <button type="button" onClick={() => load()} className="admin-btn-ghost">Обновить</button>
        </div>
      </div>

      {msg && (
        <div className={`rounded-lg px-4 py-3 text-sm border ${
          msg.type === 'ok'
            ? 'border-green-500/30 bg-green-500/10 text-green-300'
            : 'border-red-500/30 bg-red-500/10 text-red-300'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="rounded-xl border border-white/[0.06] overflow-hidden bg-white/[0.01]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-black/30">
              {['ID', 'Карта', 'Счёт', 'Сервер', 'Раунды', 'Статус', 'Дата', 'Действия'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[#475569]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-[#475569] text-xs tabular-nums">{m.id}</td>
                <td className="px-4 py-3 font-bold text-[#ff5500] text-xs uppercase">{mapLabel(m.mapName)}</td>
                <td className="px-4 py-3 font-bold tabular-nums text-base">{m.scoreCt}:{m.scoreT}</td>
                <td className="px-4 py-3 text-xs text-[#64748b]">{m.server}</td>
                <td className="px-4 py-3 text-xs tabular-nums">{m.totalRounds}</td>
                <td className="px-4 py-3">
                  <span className="text-[9px] font-bold uppercase px-2 py-1 rounded"
                    style={{
                      color: m.status === 'completed' ? '#22c55e' : '#eab308',
                      background: m.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                    }}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[10px] text-[#475569] tabular-nums">
                  {new Date(m.endedAt ?? m.startedAt).toLocaleDateString('ru-RU')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/live/match/${m.id}`} target="_blank"
                      className="admin-btn-ghost" style={{ padding: '4px 8px', fontSize: 9 }}>
                      View
                    </Link>
                    {m.status === 'live' && (
                      <button type="button" disabled={busyId === m.id}
                        onClick={() => finish(m.id)}
                        className="admin-btn-ghost"
                        style={{ padding: '4px 8px', fontSize: 9, color: '#4ade80', borderColor: 'rgba(34,197,94,0.3)' }}>
                        {busyId === m.id ? '...' : 'Завершить'}
                      </button>
                    )}
                    {m.status === 'live' && (
                      <button type="button" disabled={busyId === m.id}
                        onClick={() => resetServer(m.serverId, m.server)}
                        className="admin-btn-ghost"
                        style={{ padding: '4px 8px', fontSize: 9, color: '#eab308', borderColor: 'rgba(234,179,8,0.3)' }}>
                        Сброс live
                      </button>
                    )}
                    <button type="button" disabled={busyId === m.id}
                      onClick={e => remove(m.id, e)}
                      className="admin-btn-ghost"
                      style={{ padding: '4px 8px', fontSize: 9, color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
                      {busyId === m.id ? '...' : 'Удалить'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-[#64748b] text-sm">
            {filter === 'live' ? 'Нет live-матчей' : 'Нет матчей — запусти GSI test или сыграй карту'}
          </div>
        )}
      </div>
    </div>
  );
}



function AdminOverviewSection({ onNavigate }: { onNavigate: (tab: LiveSubTab) => void }) {
  const [data, setData] = useState<AdminLiveOverview | null>(null);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busyServerId, setBusyServerId] = useState<number | null>(null);
  const [busyMatchId, setBusyMatchId] = useState<number | null>(null);
  const [gsiCfg, setGsiCfg] = useState<(GsiConfigResponse & { id: number }) | null>(null);
  const [gsiHost, setGsiHost] = useState('localhost:5006');

  const load = useCallback(() => {
    adminLiveApi.overview().then(setData).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const finishMatch = async (id: number) => {
    if (!confirm('Завершить матч? Счёт сохранится, live сбросится.')) return;
    setBusyMatchId(id);
    setMsg(null);
    try {
      await adminLiveApi.finishMatch(id);
      setMsg({ type: 'ok', text: `Матч #${id} завершён` });
      load();
    } catch (e) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Не удалось завершить' });
    } finally {
      setBusyMatchId(null);
    }
  };

  const removeMatch = async (id: number, e: MouseEvent<HTMLButtonElement>, serverId?: number, serverName?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Удалить матч и всю статистику безвозвратно?')) return;
    setBusyMatchId(id);
    setMsg(null);
    try {
      await adminLiveApi.deleteMatch(id);
      setData(prev => prev ? {
        ...prev,
        recentMatches: prev.recentMatches.filter(m => m.id !== id),
      } : prev);
      setMsg({ type: 'ok', text: `Матч #${id} удалён` });
      load();
    } catch (err) {
      if (serverId && serverName) {
        try {
          const r = await adminLiveApi.deleteServerLiveMatches(serverId);
          setMsg({ type: 'ok', text: formatServerClearMsg(serverName, r) });
          load();
          return;
        } catch (inner) {
          setMsg({ type: 'err', text: inner instanceof Error ? inner.message : 'Не удалось удалить' });
          return;
        }
      }
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Не удалось удалить' });
    } finally {
      setBusyMatchId(null);
    }
  };

  const deleteServerLive = async (serverId: number, serverName: string, e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Сбросить live на «${serverName}»? Данные с экрана исчезнут на ~5 мин (GSI пауза).`)) return;
    setBusyServerId(serverId);
    setMsg(null);
    try {
      const r = await adminLiveApi.deleteServerLiveMatches(serverId);
      setMsg({ type: 'ok', text: formatServerClearMsg(serverName, r) });
      load();
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Не удалось удалить' });
    } finally {
      setBusyServerId(null);
    }
  };

  const resumeGsi = async (serverId: number, serverName: string) => {
    setBusyServerId(serverId);
    setMsg(null);
    try {
      await adminLiveApi.resumeGsi(serverId);
      setMsg({ type: 'ok', text: `«${serverName}»: GSI снова принимает данные` });
      load();
    } catch (e) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Ошибка' });
    } finally {
      setBusyServerId(null);
    }
  };

  const resetServer = async (serverId: number, serverName: string) => {
    if (!confirm(`Завершить live на «${serverName}»? Матчи сохранятся как completed.`)) return;
    setBusyServerId(serverId);
    setMsg(null);
    try {
      const r = await adminLiveApi.resetServerLive(serverId);
      setMsg({ type: 'ok', text: formatServerClearMsg(serverName, r) });
      load();
    } catch (e) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Ошибка сброса live' });
    } finally {
      setBusyServerId(null);
    }
  };

  const purgeAllMatches = async (serverId: number, serverName: string) => {
    if (!confirm(`Удалить ВСЕ матчи «${serverName}» навсегда (live + completed)?`)) return;
    setBusyServerId(serverId);
    setMsg(null);
    try {
      const r = await adminLiveApi.purgeAllServerMatches(serverId);
      setMsg({ type: 'ok', text: `«${serverName}»: удалено матчей ${r.deleted} · GSI сброшен` });
      load();
    } catch (e) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Ошибка удаления' });
    } finally {
      setBusyServerId(null);
    }
  };

  const hardDeleteServer = async (serverId: number, serverName: string) => {
    if (!confirm(`Удалить сервер «${serverName}» НАВСЕГДА вместе со всеми матчами и veto?`)) return;
    setBusyServerId(serverId);
    setMsg(null);
    try {
      const r = await adminServersApi.hardDelete(serverId);
      setMsg({ type: 'ok', text: `«${serverName}» удалён · матчей: ${r.deletedMatches}, veto: ${r.deletedVetoSeries}` });
      load();
    } catch (e) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Не удалось удалить сервер' });
    } finally {
      setBusyServerId(null);
    }
  };

  const showGsiCfg = async (serverId: number) => {
    try {
      const r = await adminServersApi.gsiConfig(serverId, gsiHost || undefined);
      setGsiCfg({ id: serverId, ...r });
    } catch (e) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Не удалось получить GSI cfg' });
    }
  };

  const matchActions = (m: AdminLiveOverview['recentMatches'][number]) => (
    <div className="flex flex-wrap gap-2">
      <Link to={`/live/match/${m.id}`} target="_blank"
        className="admin-btn-ghost" style={{ padding: '4px 8px', fontSize: 9 }}>
        View
      </Link>
      {m.status === 'live' && (
        <button type="button" disabled={busyMatchId === m.id}
          onClick={() => finishMatch(m.id)}
          className="admin-btn-ghost"
          style={{ padding: '4px 8px', fontSize: 9, color: '#4ade80', borderColor: 'rgba(34,197,94,0.3)' }}>
          {busyMatchId === m.id ? '...' : 'Завершить'}
        </button>
      )}
      <button type="button" disabled={busyMatchId === m.id}
        onClick={e => removeMatch(m.id, e)}
        className="admin-btn-ghost"
        style={{ padding: '4px 8px', fontSize: 9, color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
        {busyMatchId === m.id ? '...' : 'Удалить'}
      </button>
    </div>
  );

  if (!data) return <div className="py-16 text-center text-[#475569] animate-pulse tracking-widest text-sm">ЗАГРУЗКА...</div>;

  const stats = [
    { label: 'Серверов', val: data.serversTotal, sub: `${data.serversOnline} online`, color: '#22d3ee', tab: 'servers' as LiveSubTab },
    { label: 'Live сейчас', val: data.serversLive, sub: 'GSI активен', color: '#ff5500', tab: 'servers' as LiveSubTab },
    { label: 'Матчей в БД', val: data.matchesTotal, sub: `${data.matchesLive} live`, color: '#22c55e', tab: 'matches' as LiveSubTab },
    { label: 'Active Veto', val: data.activeVeto, sub: 'серий', color: '#eab308', tab: 'veto' as LiveSubTab },
  ];

  return (
    <div className="space-y-8">
      {msg && (
        <div className={`rounded-lg px-4 py-3 text-sm border ${
          msg.type === 'ok'
            ? 'border-green-500/30 bg-green-500/10 text-green-300'
            : 'border-red-500/30 bg-red-500/10 text-red-300'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <button key={s.label} type="button" onClick={() => onNavigate(s.tab)} className="admin-stat-card">
            <div className="admin-stat-card__label">{s.label}</div>
            <div className="admin-stat-card__value" style={{ color: s.color }}>{s.val}</div>
            <div className="admin-stat-card__sub">{s.sub}</div>
          </button>
        ))}
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest text-[#64748b] mb-3 font-bold">Статус серверов</div>
        <div className="rounded-xl border border-white/[0.06] overflow-hidden bg-white/[0.01]">
          {data.servers.map(s => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02]">
              <span className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: s.isOnline ? '#22c55e' : '#334155', boxShadow: s.isOnline ? '0 0 8px #22c55e' : 'none' }} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm flex items-center gap-2 flex-wrap">
                  {s.name}
                  {s.gsiBlocked && (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded border border-cyan-500/30 text-cyan-400">
                      GSI пауза
                    </span>
                  )}
                </div>
                {s.hasMatch && (
                  <div className="text-[10px] text-[#ff5500] mt-0.5 font-bold">
                    {mapLabel(s.map ?? '')} · {s.score}
                  </div>
                )}
                {!s.hasMatch && s.isOnline && <div className="text-[10px] text-[#475569] mt-0.5">Online · ожидание матча</div>}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {s.liveMatchId != null && (
                  <>
                    <button type="button" disabled={busyMatchId === s.liveMatchId || busyServerId === s.id}
                      onClick={() => finishMatch(s.liveMatchId!)}
                      className="admin-btn-ghost"
                      style={{ padding: '4px 10px', fontSize: 9, color: '#4ade80', borderColor: 'rgba(34,197,94,0.3)' }}>
                      {busyMatchId === s.liveMatchId ? '...' : 'Завершить'}
                    </button>
                    <button type="button" disabled={busyMatchId === s.liveMatchId || busyServerId === s.id}
                      onClick={e => removeMatch(s.liveMatchId!, e, s.id, s.name)}
                      className="admin-btn-ghost"
                      style={{ padding: '4px 10px', fontSize: 9, color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
                      {busyMatchId === s.liveMatchId ? '...' : 'Удалить'}
                    </button>
                  </>
                )}
                {s.hasMatch && s.liveMatchId == null && (
                  <button type="button" disabled={busyServerId === s.id}
                    onClick={e => deleteServerLive(s.id, s.name, e)}
                    className="admin-btn-ghost"
                    style={{ padding: '4px 10px', fontSize: 9, color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
                    {busyServerId === s.id ? '...' : 'Удалить live'}
                  </button>
                )}
                {s.hasMatch && (
                  <button type="button" disabled={busyServerId === s.id || busyMatchId === s.liveMatchId}
                    onClick={() => resetServer(s.id, s.name)}
                    className="admin-btn-ghost"
                    style={{ padding: '4px 10px', fontSize: 9, color: '#eab308', borderColor: 'rgba(234,179,8,0.3)' }}>
                    {busyServerId === s.id ? '...' : 'Сброс live'}
                  </button>
                )}
                {!s.hasMatch && (
                  <button type="button" disabled={busyServerId === s.id}
                    onClick={e => deleteServerLive(s.id, s.name, e)}
                    className="admin-btn-ghost"
                    style={{ padding: '4px 10px', fontSize: 9, color: '#64748b', borderColor: 'rgba(100,116,139,0.3)' }}
                    title="Сбросить live с экрана (GSI пауза 5 мин)">
                    {busyServerId === s.id ? '...' : 'Сбросить live'}
                  </button>
                )}
                {s.gsiBlocked && (
                  <button type="button" disabled={busyServerId === s.id}
                    onClick={() => resumeGsi(s.id, s.name)}
                    className="admin-btn-ghost"
                    style={{ padding: '4px 10px', fontSize: 9, color: '#22d3ee', borderColor: 'rgba(34,211,238,0.3)' }}>
                    {busyServerId === s.id ? '...' : 'Включить GSI'}
                  </button>
                )}
                <button type="button" disabled={busyServerId === s.id}
                  onClick={() => showGsiCfg(s.id)}
                  className="admin-btn-ghost"
                  style={{ padding: '4px 10px', fontSize: 9, color: '#22d3ee', borderColor: 'rgba(34,211,238,0.3)' }}>
                  GSI cfg
                </button>
                <button type="button" disabled={busyServerId === s.id}
                  onClick={() => purgeAllMatches(s.id, s.name)}
                  className="admin-btn-ghost"
                  style={{ padding: '4px 10px', fontSize: 9, color: '#f97316', borderColor: 'rgba(249,115,22,0.3)' }}>
                  Все матчи ✕
                </button>
                <button type="button" disabled={busyServerId === s.id}
                  onClick={() => hardDeleteServer(s.id, s.name)}
                  className="admin-btn-ghost"
                  style={{ padding: '4px 10px', fontSize: 9, color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)' }}>
                  Сервер ✕
                </button>
                <Link to={`/live/${s.id}`} target="_blank" className="text-[10px] text-cyan-400 font-bold hover:underline">Live →</Link>
              </div>
            </div>
          ))}
          {data.servers.length === 0 && <div className="p-10 text-center text-[#64748b] text-sm">Нет серверов — добавь в «Серверы GSI»</div>}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="text-[10px] uppercase tracking-widest text-[#64748b] font-bold">Последние матчи</div>
          <button type="button" onClick={() => onNavigate('matches')} className="admin-btn-ghost" style={{ padding: '4px 10px', fontSize: 9 }}>
            Все матчи →
          </button>
        </div>
        <div className="rounded-xl border border-white/[0.06] overflow-hidden bg-white/[0.01]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-black/30">
                {['ID', 'Карта', 'Счёт', 'Сервер', 'Статус', 'Дата', 'Действия'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[#475569]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentMatches.map(m => (
                <tr key={m.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-[#475569] text-xs tabular-nums">{m.id}</td>
                  <td className="px-4 py-3 font-bold text-[#ff5500] text-xs uppercase">{mapLabel(m.mapName)}</td>
                  <td className="px-4 py-3 font-bold tabular-nums">{m.scoreCt}:{m.scoreT}</td>
                  <td className="px-4 py-3 text-xs text-[#64748b]">{m.server}</td>
                  <td className="px-4 py-3">
                    <span className="text-[9px] font-bold uppercase px-2 py-1 rounded"
                      style={{
                        color: m.status === 'completed' ? '#22c55e' : '#eab308',
                        background: m.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                      }}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-[#475569] tabular-nums">
                    {new Date(m.endedAt ?? m.startedAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-4 py-3">{matchActions(m)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.recentMatches.length === 0 && (
            <div className="py-12 text-center text-[#64748b] text-sm">Нет матчей</div>
          )}
        </div>
      </div>

      {gsiCfg && (
        <GsiCfgModal
          cfg={gsiCfg}
          host={gsiHost}
          onHostChange={setGsiHost}
          onRefresh={() => showGsiCfg(gsiCfg.id)}
          onClose={() => setGsiCfg(null)}
        />
      )}

      <div className="admin-toolbar">

        <Link to="/live" target="_blank" className="admin-btn-ghost" style={{ color: '#ff5500', borderColor: 'rgba(255,85,0,0.35)' }}>

          Открыть /live

        </Link>

        <Link to="/gsi-test" target="_blank" className="admin-btn-ghost">GSI Test</Link>

        <button type="button" onClick={() => onNavigate('guide')} className="admin-btn-ghost" style={{ color: '#22d3ee', borderColor: 'rgba(34,211,238,0.3)' }}>

          Инструкция GSI

        </button>

        <button type="button" onClick={() => onNavigate('veto')} className="admin-btn-ghost" style={{ color: '#eab308', borderColor: 'rgba(234,179,8,0.3)' }}>

          Map Veto →

        </button>

      </div>

    </div>

  );

}



export type LiveSubTab = 'overview' | 'servers' | 'veto' | 'matches' | 'guide';



export function AdminLivePanel({ inLiveZone = false }: { inLiveZone?: boolean }) {

  const [sub, setSub]         = useState<LiveSubTab>('overview');

  const [servers, setServers] = useState<GameServerRow[]>([]);

  const [pendingVeto, setPendingVeto] = useState<VetoSeries | null>(null);



  const refreshServers = useCallback(() => {
    adminServersApi.list().then(setServers).catch(() => {});
  }, []);



  useEffect(() => { refreshServers(); }, [sub, refreshServers]);



  return (

    <div className={`admin-live space-y-8${inLiveZone ? ' admin-live--in-zone' : ' p-8'}`}>

      <div className="admin-live__hero">

        <div>

          <div className="admin-live__title">
            {inLiveZone ? 'Пульт управления Live' : 'Live Stats · Администрирование'}
          </div>

          <p className="admin-live__subtitle">

            {inLiveZone
              ? 'GSI, veto, матчи — всё, что настраивает публичный эфир /live для гостей.'
              : 'GSI-серверы, map veto (BO1–BO5), история матчей. Всё, что видят игроки на публичной странице /live — настраивается здесь.'}

          </p>

        </div>

        <Link to="/live" target="_blank"

          className="admin-btn-ghost shrink-0"

          style={{ color: '#ff5500', borderColor: 'rgba(255,85,0,0.4)', padding: '10px 18px' }}>

          {inLiveZone ? 'Публичный эфир ↗' : 'Открыть Live Stats →'}

        </Link>

      </div>



      <div className="admin-live__tabs">

        <AdminTab active={sub === 'overview'} label="Обзор" onClick={() => setSub('overview')} />

        <AdminTab active={sub === 'servers'} label="Серверы GSI" onClick={() => setSub('servers')} />

        <AdminTab active={sub === 'veto'} label="Map Veto" onClick={() => setSub('veto')} />

        <AdminTab active={sub === 'matches'} label="Матчи" onClick={() => setSub('matches')} />

        <AdminTab active={sub === 'guide'} label="Инструкция" onClick={() => setSub('guide')} />

      </div>



      {sub === 'overview' && <AdminOverviewSection onNavigate={setSub} />}

      <div className={sub === 'servers' ? '' : 'hidden'}>
        <AdminServersPanel
          embedded
          onChanged={refreshServers}
          onVetoCreated={(series) => {
            refreshServers();
            setPendingVeto(series);
          }}
        />
      </div>

      {sub === 'veto' && (
        <AdminVetoSection
          servers={servers}
          pendingSeries={pendingVeto}
          onPendingConsumed={() => setPendingVeto(null)}
        />
      )}

      {sub === 'matches' && <AdminMatchesSection />}

      {sub === 'guide' && (

        <div className="rounded-xl border border-white/[0.06] overflow-hidden">

          <GsiSetupGuide apiHost="http://localhost:5006" />

        </div>

      )}

    </div>

  );

}


