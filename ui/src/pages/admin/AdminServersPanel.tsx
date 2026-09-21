import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminServersApi, adminVetoApi, pcApi, type GameServerRow, type Pc, type VetoSeries } from '../../services/api';
import { GsiSetupGuide } from '../../components/live/GsiSetupGuide';
import { GsiCfgModal } from '../../components/live/GsiCfgModal';
import { VETO_FORMATS, type VetoFormatId } from '../../components/live/vetoFormats';
import type { GsiConfigResponse } from '../../services/api';

export function AdminServersPanel({
  embedded,
  onChanged,
  onVetoCreated,
}: {
  embedded?: boolean;
  onChanged?: () => void;
  onVetoCreated?: (series: VetoSeries) => void;
} = {}) {
  const [servers, setServers] = useState<GameServerRow[]>([]);
  const [pcs, setPcs]         = useState<Pc[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cfg, setCfg]         = useState<(GsiConfigResponse & { id: number }) | null>(null);
  const [form, setForm]       = useState({ name: '', ipAddress: '', port: '', linkedPcId: '' });
  const [vetoForm, setVetoForm] = useState({ enabled: true, team1: '', team2: '', format: 'bo3' as VetoFormatId });
  const [showForm, setShowForm] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [host, setHost]       = useState('localhost:5006');

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setRefreshing(true);
      setError(null);
    }
    try {
      const s = await adminServersApi.list();
      setServers(s);
      try {
        setPcs(await pcApi.getAll());
      } catch {
        /* список ПК не блокирует серверы */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить серверы');
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!form.name.trim()) {
      setError('Укажи название сервера');
      return;
    }
    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await adminServersApi.create({
        name: form.name.trim(),
        ipAddress: form.ipAddress.trim() || undefined,
        port: form.port ? Number(form.port) : undefined,
        linkedPcId: form.linkedPcId ? Number(form.linkedPcId) : undefined,
      });
      setForm({ name: '', ipAddress: '', port: '', linkedPcId: '' });
      setShowForm(false);
      setServers(prev => {
        const exists = prev.some(s => s.id === created.id);
        return exists ? prev.map(s => s.id === created.id ? created : s) : [created, ...prev];
      });
      setSuccess(`Сервер «${created.name}» создан — скопируй GSI cfg ниже.`);
      await showCfg(created.id);
      onChanged?.();

      let createdVeto: VetoSeries | undefined;
      if (vetoForm.enabled && vetoForm.team1.trim() && vetoForm.team2.trim()) {
        try {
          createdVeto = await adminVetoApi.create({
            team1Name: vetoForm.team1.trim(),
            team2Name: vetoForm.team2.trim(),
            serverId: created.id,
            format: vetoForm.format,
          });
          setSuccess(`Сервер «${created.name}» + Map Veto ${vetoForm.format.toUpperCase()} созданы. Cfg открыт — после копирования перейди во вкладку Map Veto.`);
        } catch (e) {
          setError(`Сервер создан, но veto не удалось: ${e instanceof Error ? e.message : 'ошибка'}`);
        }
      }

      setVetoForm({ enabled: true, team1: '', team2: '', format: 'bo3' });
      await load(true);
      if (createdVeto) onVetoCreated?.(createdVeto);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать сервер');
    } finally {
      setCreating(false);
    }
  };

  const showCfg = async (id: number) => {
    try {
      const r = await adminServersApi.gsiConfig(id, host || undefined);
      setCfg({ id, ...r });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось получить GSI cfg');
    }
  };

  if (initialLoading) {
    return <div className={`${embedded ? 'py-8' : 'p-8'} text-[#475569] text-sm animate-pulse tracking-widest`}>ЗАГРУЗКА...</div>;
  }

  return (
    <div className={embedded ? 'space-y-6' : 'p-8 space-y-6'}>
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {success}
        </div>
      )}
      {refreshing && (
        <div className="text-[10px] text-[#64748b] tracking-widest uppercase animate-pulse">Обновление...</div>
      )}
      {!embedded && (
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[.15em] text-white/80">Серверы CS2 · GSI</h2>
          <p className="text-[11px] text-[#475569] mt-1 max-w-lg">
            Управление игровыми серверами клуба. GSI отправляет live-статистику на сайт в стиле HLTV.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/live" target="_blank"
            className="px-4 py-2 rounded text-[11px] uppercase tracking-widest font-bold border border-[#ff5500]/30 text-[#ff5500] hover:bg-[#ff5500]/10">
            Live Stats →
          </Link>
          <Link to="/gsi-test" target="_blank"
            className="px-4 py-2 rounded text-[11px] uppercase tracking-widest border border-white/10 text-[#64748b] hover:text-white">
            GSI Test
          </Link>
          <button type="button" onClick={() => setShowGuide(v => !v)}
            className="px-4 py-2 rounded text-[11px] uppercase tracking-widest font-bold border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
            {showGuide ? 'Скрыть инструкцию' : 'Инструкция'}
          </button>
          <button type="button" onClick={() => setShowForm(v => !v)}
            className="px-4 py-2 rounded text-[11px] uppercase tracking-widest font-bold"
            style={{ background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171' }}>
            + Сервер
          </button>
        </div>
      </div>
      )}

      {embedded && (
        <div className="flex flex-wrap gap-2 justify-end">
          <button type="button" onClick={() => setShowGuide(v => !v)}
            className="px-3 py-1.5 rounded text-[10px] uppercase tracking-widest font-bold border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
            {showGuide ? 'Скрыть инструкцию' : 'Инструкция'}
          </button>
          <button type="button" onClick={() => setShowForm(v => !v)}
            className="px-3 py-1.5 rounded text-[10px] uppercase tracking-widest font-bold"
            style={{ background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171' }}>
            + Сервер
          </button>
        </div>
      )}

      {showGuide && (
        <div className="rounded-xl border border-cyan-500/20 overflow-hidden">
          <GsiSetupGuide apiHost={`http://${host.replace(/^https?:\/\//, '')}`} />
        </div>
      )}

      {/* Host for cfg generation */}
      <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02] flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] text-[#64748b] uppercase tracking-wider block mb-1">
            Public Host API (для GSI cfg)
          </label>
          <input
            value={host}
            onChange={e => setHost(e.target.value)}
            placeholder="192.168.1.50:5006"
            className="w-full px-3 py-2 rounded text-sm border border-white/[0.08] bg-black/40 text-white outline-none font-mono"
          />
          <p className="text-[10px] text-[#475569] mt-1">
            IP:port, с которого CS2 достучится до API. Локально: localhost:5006
          </p>
        </div>
        <Link to="/live/setup" className="text-[11px] text-cyan-400 hover:underline pb-2">
          Полная инструкция на сайте →
        </Link>
      </div>

      {showForm && (
        <div className="rounded-xl border border-white/[0.08] p-5 bg-white/[0.02] grid sm:grid-cols-2 gap-3">
          <input placeholder="Название (STAGE #1)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="px-3 py-2 rounded text-sm border border-white/[0.08] bg-black/40 text-white outline-none sm:col-span-2" />
          <input placeholder="IP игрового сервера (192.168.1.100)" value={form.ipAddress} onChange={e => setForm(f => ({ ...f, ipAddress: e.target.value }))}
            className="px-3 py-2 rounded text-sm border border-white/[0.08] bg-black/40 text-white outline-none" />
          <input placeholder="Port (27015)" value={form.port} onChange={e => setForm(f => ({ ...f, port: e.target.value }))}
            className="px-3 py-2 rounded text-sm border border-white/[0.08] bg-black/40 text-white outline-none" />
          <select value={form.linkedPcId} onChange={e => setForm(f => ({ ...f, linkedPcId: e.target.value }))}
            className="px-3 py-2 rounded text-sm border border-white/[0.08] bg-black/40 text-white outline-none sm:col-span-2">
            <option value="">— Привязать к ПК (опционально) —</option>
            {pcs.map(p => <option key={p.id} value={p.id}>ПК #{p.number} · {p.zone}</option>)}
          </select>

          <div className="sm:col-span-2 rounded-xl border border-[#ff5500]/20 bg-[#ff5500]/5 p-4 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={vetoForm.enabled}
                onChange={e => setVetoForm(v => ({ ...v, enabled: e.target.checked }))}
                className="accent-[#ff5500]" />
              <span className="text-sm font-bold text-[#ff5500]">Сразу настроить Map Veto (баны / пики)</span>
            </label>
            {vetoForm.enabled && (
              <>
                <div className="format-picker">
                  {VETO_FORMATS.map(f => (
                    <button key={f.id} type="button"
                      onClick={() => setVetoForm(v => ({ ...v, format: f.id }))}
                      className={`format-card${vetoForm.format === f.id ? ' format-card--active' : ''}`}>
                      <span className="format-card__maps">{f.mapsPlayed} map{f.mapsPlayed > 1 ? 's' : ''}</span>
                      <div className="format-card__short">{f.short}</div>
                      <div className="format-card__desc">{f.description}</div>
                    </button>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input placeholder="Команда 1 (CyberX Alpha)" value={vetoForm.team1}
                    onChange={e => setVetoForm(v => ({ ...v, team1: e.target.value }))}
                    className="px-3 py-2 rounded text-sm border border-white/[0.08] bg-black/40 text-white outline-none" />
                  <input placeholder="Команда 2 (CyberX Beta)" value={vetoForm.team2}
                    onChange={e => setVetoForm(v => ({ ...v, team2: e.target.value }))}
                    className="px-3 py-2 rounded text-sm border border-white/[0.08] bg-black/40 text-white outline-none" />
                </div>
                <p className="text-[10px] text-[#64748b] leading-relaxed">
                  После создания откроется вкладка Map Veto — пройди шаги банов/пиков. На /live команды увидят veto и live-стат.
                </p>
              </>
            )}
          </div>

          <button type="button" onClick={create} disabled={creating}
            className="sm:col-span-2 py-2 rounded text-sm font-bold uppercase tracking-widest disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#7f1d1d,#ef4444)', color: '#fff' }}>
            {creating ? 'Создание...' : 'Создать сервер'}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {servers.map(s => (
          <div key={s.id} className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="font-bold text-sm flex items-center gap-2 flex-wrap">
                  {s.name}
                  {!s.isActive && <span className="text-[9px] text-red-400 uppercase px-1.5 py-0.5 border border-red-400/30 rounded">off</span>}
                  <Link to={`/live/${s.id}`} className="text-[9px] text-[#ff5500] hover:underline font-normal">view live</Link>
                </div>
                <div className="text-[11px] text-[#475569] mt-1">
                  {s.ipAddress && `${s.ipAddress}${s.port ? `:${s.port}` : ''}`}
                  {s.linkedPc && ` · ПК #${s.linkedPc}`}
                </div>
                <div className="text-[10px] text-[#64748b] mt-1 font-mono truncate max-w-lg">{s.gsiUrl}</div>
                <div className="text-[10px] text-[#475569] mt-0.5 font-mono">token: {s.gsiToken}</div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button type="button" onClick={() => showCfg(s.id)}
                  className="px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                  GSI cfg
                </button>
                <button type="button" onClick={async () => { await adminServersApi.regenToken(s.id); load(); }}
                  className="px-3 py-1.5 rounded text-[10px] border border-white/10 text-[#64748b] hover:text-white">
                  Новый token
                </button>
                <button type="button" onClick={async () => { await adminServersApi.toggle(s.id); load(); }}
                  className="px-3 py-1.5 rounded text-[10px] border border-white/10 text-[#64748b] hover:text-white">
                  {s.isActive ? 'Выкл' : 'Вкл'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {servers.length === 0 && (
          <div className="py-12 text-center text-[#475569] text-sm border border-dashed border-white/10 rounded-xl">
            Нет серверов — нажми «+ Сервер» и следуй инструкции
          </div>
        )}
      </div>

      {cfg && (
        <GsiCfgModal
          cfg={cfg}
          host={host}
          onHostChange={setHost}
          onRefresh={() => showCfg(cfg.id)}
          onClose={() => setCfg(null)}
        />
      )}
    </div>
  );
}
