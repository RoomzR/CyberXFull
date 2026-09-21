import { useState } from 'react';
import type { GsiConfigResponse } from '../../services/api';

export function GsiCfgModal({
  cfg,
  host,
  onHostChange,
  onRefresh,
  onClose,
}: {
  cfg: GsiConfigResponse & { id: number };
  host: string;
  onHostChange: (v: string) => void;
  onRefresh: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyCfg = () => {
    void navigator.clipboard.writeText(cfg.cfg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[200] p-4" onClick={onClose}>
      <div className="rounded-xl border border-cyan-500/30 p-6 max-w-2xl w-full max-h-[85vh] overflow-auto"
        style={{ background: '#0a0a14' }} onClick={e => e.stopPropagation()}>
        <div className="text-sm font-bold text-cyan-400 mb-1">gamestate_integration_cyberx.cfg</div>
        <div className="text-[10px] text-[#64748b] mb-3 font-mono break-all">{cfg.uri}</div>

        <div className="mb-4 p-3 rounded border border-[#ff5500]/30 bg-[#ff5500]/5 text-[11px] text-orange-200/90 leading-relaxed space-y-2">
          <div className="font-bold text-[#ff5500]">10 игроков = cfg на DEDICATED SERVER</div>
          <div><strong>Сервер клуба:</strong> <code className="text-cyan-300">{cfg.dedicatedInstallPath ?? cfg.installPath}</code></div>
          <div><strong>Локальный тест (только ты):</strong> <code className="text-[#64748b]">{cfg.clientInstallPath ?? '…\\csgo\\cfg\\…'}</code></div>
          {(cfg.playerHints ?? []).map(h => (
            <div key={h} className="text-[#94a3b8]">• {h}</div>
          ))}
        </div>

        <div className="mb-3">
          <label className="text-[10px] text-[#64748b] uppercase">Public Host API (IP:port с игрового сервера)</label>
          <div className="flex gap-2 mt-1">
            <input value={host} onChange={e => onHostChange(e.target.value)} placeholder="26.131.11.192:5006"
              className="flex-1 px-3 py-2 rounded text-xs border border-white/10 bg-black/40 text-white outline-none font-mono" />
            <button type="button" onClick={onRefresh} className="px-3 py-2 text-[10px] text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-500/10">
              Обновить
            </button>
          </div>
        </div>

        <pre className="text-[10px] font-mono text-[#8899bb] whitespace-pre-wrap leading-relaxed p-4 rounded border border-white/[0.06] bg-black/40">{cfg.cfg}</pre>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={copyCfg}
            className="py-2.5 rounded text-[11px] font-bold uppercase tracking-widest"
            style={{ background: 'rgba(34,211,238,.1)', border: '1px solid rgba(34,211,238,.3)', color: '#22d3ee' }}>
            {copied ? 'Скопировано ✓' : 'Скопировать cfg'}
          </button>
          <button type="button" onClick={onClose}
            className="py-2.5 rounded text-[11px] font-bold uppercase tracking-widest border border-white/10 text-[#888] hover:text-white">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
