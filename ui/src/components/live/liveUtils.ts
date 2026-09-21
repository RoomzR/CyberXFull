export const MAP_THEMES: Record<string, { label: string; from: string; to: string; accent: string }> = {
  de_dust2:   { label: 'DUST II',  from: '#c4a35a', to: '#5c4a1a', accent: '#e8c872' },
  de_mirage:  { label: 'MIRAGE',   from: '#d4742a', to: '#4a2810', accent: '#f0a060' },
  de_inferno: { label: 'INFERNO',  from: '#8b4513', to: '#3d1f0a', accent: '#c87840' },
  de_nuke:    { label: 'NUKE',     from: '#4a7a4a', to: '#1a301a', accent: '#7ab87a' },
  de_ancient: { label: 'ANCIENT',  from: '#2d6a4f', to: '#0f2922', accent: '#52b788' },
  de_anubis:  { label: 'ANUBIS',   from: '#c9a227', to: '#4a3810', accent: '#e8c547' },
  de_vertigo: { label: 'VERTIGO',  from: '#607080', to: '#283040', accent: '#90a8c0' },
  de_overpass:{ label: 'OVERPASS', from: '#5080a0', to: '#203040', accent: '#70b0d0' },
};

export function mapTheme(name: string) {
  const key = name.toLowerCase();
  return MAP_THEMES[key] ?? {
    label: mapLabel(name),
    from: '#334155',
    to: '#0f172a',
    accent: '#64748b',
  };
}

export function mapLabel(name?: string | null) {
  if (!name) return '—';
  return name.replace(/^de_/, '').replace(/^cs_/, '').replace(/_/g, ' ').toUpperCase();
}

export function weaponLabel(w?: string) {
  if (!w) return '—';
  return w.replace(/^weapon_/, '').replace(/_/g, ' ').toUpperCase();
}

export function formatTime(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function kdColor(kd: number) {
  if (kd >= 1.3) return '#22c55e';
  if (kd >= 1.0) return '#86efac';
  if (kd >= 0.8) return '#e2e8f0';
  return '#f87171';
}

export function ratingFromKd(kd: number) {
  return Math.min(2.0, Math.max(0.1, kd * 0.85 + 0.15)).toFixed(2);
}

export function normalizeTeam(team: string): 'CT' | 'T' | 'UNK' {
  const u = team.trim().toUpperCase();
  if (u.startsWith('CT') || u.includes('COUNTER')) return 'CT';
  if (u.startsWith('T') || u.includes('TERROR')) return 'T';
  return 'UNK';
}

export function isCtTeam(team: string) { return normalizeTeam(team) === 'CT'; }
export function isTTeam(team: string) { return normalizeTeam(team) === 'T'; }

export function formatMoney(amount: number) {
  return `$${amount.toLocaleString('en-US')}`;
}

export function splitTeams<T extends { team: string; alive?: boolean }>(players: T[]) {
  const ct = players.filter(p => isCtTeam(p.team));
  const t = players.filter(p => isTTeam(p.team));
  const unk = players.filter(p => normalizeTeam(p.team) === 'UNK');
  return { ct, t, unk };
}
