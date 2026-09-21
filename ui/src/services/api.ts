const API_BASE = import.meta.env.VITE_API_URL ?? '';
const ACCESS_KEY  = 'cyberx_access';
const REFRESH_KEY = 'cyberx_refresh';

function getToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json() as { accessToken: string; refreshToken: string };
    localStorage.setItem(ACCESS_KEY, data.accessToken);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retried = false,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !retried && !path.startsWith('/api/auth/')) {
    if (await refreshAccessToken()) {
      return request<T>(method, path, body, true);
    }
    throw new Error('Сессия истекла — обнови страницу и войди снова');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, string>;
    throw new Error(err['detail'] ?? err['message'] ?? err['title'] ?? `Ошибка ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

const get  = <T>(path: string)                => request<T>('GET',    path);
const post = <T>(path: string, body?: unknown) => request<T>('POST',   path, body);
const put  = <T>(path: string, body?: unknown) => request<T>('PUT',    path, body);
const patch= <T>(path: string, body?: unknown) => request<T>('PATCH',  path, body);
const del  = <T>(path: string)                => request<T>('DELETE', path);

// ── Types ──────────────────────────────────────────────────────────────────

export interface Pc {
  id: number; number: number; zone: string;
  specs: string; hourlyRate: number; status: string;
}

export interface Booking {
  id: number; pcId: number; startTime: string; durationH: number;
  totalPrice: number; status: string; notes?: string; createdAt?: string;
  pc: { number: number; zone: string; specs: string; hourlyRate?: number };
}

export interface AdminBooking {
  id: number; pcId: number; startTime: string; durationH: number;
  totalPrice: number; status: string; notes?: string; createdAt?: string;
  user: { id: number; username: string; email: string };
  pc: { id: number; number: number; zone: string };
}

export interface UserRow {
  id: number; username: string; email: string; role: string;
  balance: number; isActive: boolean; createdAt: string; lastLoginAt?: string;
}

export interface AdminStats {
  totalUsers: number; activeUsers: number;
  totalPcs: number; freePcs: number; occupiedPcs: number;
  todayBookings: number; todayRevenue: number; monthRevenue: number;
  pcStatusMap: { status: string; count: number }[];
  zoneStats: { zone: string; total: number; occupied: number }[];
  recentBookings: {
    id: number; startTime: string; durationH: number;
    totalPrice: number; status: string; user: string; pc: number; zone: string;
  }[];
}

// ── PC API ─────────────────────────────────────────────────────────────────
export const pcApi = {
  getAll:       ()              => get<Pc[]>('/api/pcs'),
  setStatus:    (id: number, status: string) => patch<Pc>(`/api/pcs/${id}/status`, { status }),
  create:       (dto: Omit<Pc,'id'|'status'>) => post<Pc>('/api/pcs', dto),
  update:       (id: number, dto: Omit<Pc,'id'|'status'>) => put<Pc>(`/api/pcs/${id}`, dto),
  remove:       (id: number) => del<void>(`/api/pcs/${id}`),
};

// ── Booking API ────────────────────────────────────────────────────────────
export const bookingApi = {
  getMine:      ()              => get<Booking[]>('/api/bookings/my'),
  create:       (pcId: number, startTime: string, durationH: number, notes?: string) =>
    post<{ id: number; status: string; totalPrice: number }>('/api/bookings', { pcId, startTime, durationH, notes }),
  cancel:       (id: number)   => del<{ message: string }>(`/api/bookings/${id}`),
  getAll:       (status?: string, date?: string) => {
    const p = new URLSearchParams();
    if (status) p.set('status', status);
    if (date)   p.set('date', date);
    return get<AdminBooking[]>(`/api/bookings?${p}`);
  },
  setStatus:    (id: number, status: string) =>
    patch<{ id: number; status: string }>(`/api/bookings/${id}/status`, { status }),
};

// ── Admin API ──────────────────────────────────────────────────────────────
export const adminApi = {
  stats:        ()              => get<AdminStats>('/api/admin/stats'),
  users:        (search?: string) => {
    const p = search ? `?search=${encodeURIComponent(search)}` : '';
    return get<UserRow[]>(`/api/admin/users${p}`);
  },
  setRole:      (id: number, role: string) => patch<{id:number;role:string}>(`/api/admin/users/${id}/role`, { role }),
  toggleUser:   (id: number) => patch<{id:number;isActive:boolean}>(`/api/admin/users/${id}/toggle`, {}),
  addBalance:   (id: number, amount: number) => patch<{id:number;balance:number}>(`/api/admin/users/${id}/balance`, { amount }),
  revenueChart: () => get<{date:string;revenue:number}[]>('/api/admin/revenue-chart'),
};

// ── Profile API ────────────────────────────────────────────────────────────
export interface PlayerStats {
  totalBookings: number;
  totalHours: number;
  totalSpent: number;
  favoriteZone: string | null;
}

export const profileApi = {
  get:          () => get<{ id:number; username:string; email:string; role:string; balance:number; createdAt:string }>('/api/profile'),
  bookings:     () => get<Booking[]>('/api/profile/bookings'),
  activeSession:() => get<(Booking & { endTime: string }) | null>('/api/profile/active-session'),
  updateUsername:(username: string) => patch<{username:string}>('/api/profile/username', { username }),
  stats:        () => get<PlayerStats>('/api/profile/stats'),
};

// ── Leaderboard API ────────────────────────────────────────────────────────
export interface LeaderRow {
  username: string;
  hours: number;
  spent: number;
  sessions: number;
}

export const leaderboardApi = {
  top: () => get<LeaderRow[]>('/api/leaderboard'),
};

// ── Live / GSI stats (HLTV-style) ─────────────────────────────────────────
export interface LivePlayer {
  steamId: string; name: string; team: string;
  kills: number; deaths: number; assists: number; mvps: number; score: number;
  headshots: number; health: number; armor: number; money?: number; hasHelmet?: boolean;
  damage?: number; alive: boolean; weapon?: string;
  kd: number; hsPct: number;
  rating2?: number; rating3?: number;
}

export interface LiveMatchBrief {
  matchId: number; mapName: string; mode: string; round: number; roundPhase: string;
  scoreCt: number; scoreT: number; teamCtName: string; teamTName: string;
  bombState?: string; updatedAt: string; playerCount: number;
  aliveCt?: number; aliveT?: number;
}

export interface LiveServerOverview {
  id: number; name: string; linkedPc?: number; zone?: string;
  isOnline: boolean; lastGsiAt?: string;
  match: LiveMatchBrief | null;
}

export interface MatchSummary {
  id: number; mapName: string; mode: string;
  scoreCt: number; scoreT: number; teamCtName: string; teamTName: string;
  totalRounds: number; startedAt: string; endedAt?: string;
  server: string; winner: string;
}

export interface GameServerRow {
  id: number; name: string; gsiToken: string; ipAddress?: string; port?: number;
  linkedPcId?: number; linkedPc?: number; isActive: boolean; createdAt: string; gsiUrl: string;
}

export interface LiveServerDetail extends LiveServerOverview {
  match: (LiveMatchBrief & { players: LivePlayer[]; mapPhase?: string; startedAt?: string }) | null;
}

export interface MatchDetail {
  id: number; mapName: string; mode: string;
  scoreCt: number; scoreT: number; teamCtName: string; teamTName: string;
  totalRounds: number; status: string; startedAt: string; endedAt?: string;
  server: string;
  players: { playerName: string; team: string; kills: number; deaths: number;
    assists: number; mvps: number; score: number; headshots: number; kd: number; hsPct: number;
    rating2?: number; rating3?: number }[];
}

export interface VetoMapEntry {
  mapName: string;
  status: string;
  team?: string;
  sideNote?: string;
}

export interface VetoPlayableMap {
  order: number;
  mapName: string;
  role: string;
  label: string;
}

export interface VetoSeries {
  id: number;
  serverId?: number;
  team1Name: string;
  team2Name: string;
  format: string;
  status: string;
  createdAt: string;
  totalSteps: number;
  mapsPlayed: number;
  playableMaps: VetoPlayableMap[];
  mapPool: VetoMapEntry[];
  log: { step: number; label: string; team: string; map: string; note?: string }[];
}

export const liveApi = {
  overview:     () => get<LiveServerOverview[]>('/api/live'),
  server:       (id: number) => get<LiveServerDetail>(`/api/live/${id}`),
  matches:      (limit?: number) => get<MatchSummary[]>(`/api/live/matches${limit ? `?limit=${limit}` : ''}`),
  match:        (id: number) => get<MatchDetail>(`/api/live/matches/${id}`),
  vetoActive:   (serverId?: number) => {
    const q = serverId ? `?serverId=${serverId}` : '';
    return get<VetoSeries | null>(`/api/live/veto/active${q}`);
  },
  veto:         (id: number) => get<VetoSeries>(`/api/live/veto/${id}`),
};

export const adminVetoApi = {
  list:    () => get<VetoSeries[]>('/api/admin/veto'),
  create:  (dto: { team1Name: string; team2Name: string; serverId?: number; format?: string }) =>
    post<VetoSeries>('/api/admin/veto', dto),
  action:  (id: number, dto: { action: string; mapName: string; team: string; sideNote?: string }) =>
    post<VetoSeries>(`/api/admin/veto/${id}/actions`, dto),
  finish:  (id: number) => patch<{ id: number; status: string }>(`/api/admin/veto/${id}/finish`, {}),
  remove:  (id: number) => del<void>(`/api/admin/veto/${id}`),
  reset:   (id: number) => del<VetoSeries>(`/api/admin/veto/${id}/actions`),
};

export interface AdminLiveOverview {
  serversTotal: number;
  serversOnline: number;
  serversLive: number;
  matchesTotal: number;
  matchesLive: number;
  activeVeto: number;
  servers: {
    id: number; name: string; linkedPc?: number;
    isOnline: boolean; hasMatch: boolean; liveMatchId?: number; lastGsiAt?: string;
    map?: string; score?: string; gsiBlocked?: boolean;
  }[];
  recentMatches: {
    id: number; mapName: string; scoreCt: number; scoreT: number;
    totalRounds: number; status: string; startedAt: string; endedAt?: string;
    server: string; serverId: number;
  }[];
}

export interface AdminMatchRow {
  id: number; mapName: string; mode: string;
  scoreCt: number; scoreT: number; teamCtName: string; teamTName: string;
  totalRounds: number; status: string; startedAt: string; endedAt?: string;
  server: string; serverId: number; playerCount: number;
}

export const adminLiveApi = {
  overview: () => get<AdminLiveOverview>('/api/admin/live/overview'),
  matches:  (limit?: number) => get<AdminMatchRow[]>(`/api/admin/live/matches${limit ? `?limit=${limit}` : ''}`),
  deleteMatch: (id: number) => del<void>(`/api/admin/live/matches/${id}`),
  finishMatch: (id: number) => patch<{ id: number; status: string; scoreCt: number; scoreT: number }>(
    `/api/admin/live/matches/${id}/finish`, {}),
  resetServerLive: (serverId: number) => post<{ serverId: number; finalized: number; gsiCleared: boolean; blockedMinutes: number }>(
    `/api/admin/live/servers/${serverId}/reset-live`, {}),
  deleteServerLiveMatches: (serverId: number) => del<{ serverId: number; deleted: number; gsiCleared: boolean; blockedMinutes: number }>(
    `/api/admin/live/servers/${serverId}/live-matches`),
  purgeAllServerMatches: (serverId: number) => del<{ serverId: number; deleted: number; gsiCleared: boolean; blockedMinutes: number }>(
    `/api/admin/live/servers/${serverId}/all-matches`),
  resumeGsi: (serverId: number) => post<{ serverId: number; resumed: boolean }>(
    `/api/admin/live/servers/${serverId}/resume-gsi`, {}),
};

export interface GsiConfigResponse {
  uri: string;
  token: string;
  cfg: string;
  installPath: string;
  clientInstallPath?: string;
  dedicatedInstallPath?: string;
  playerHints?: string[];
}

export const adminServersApi = {
  list:         () => get<GameServerRow[]>('/api/admin/servers'),
  create:       (dto: { name: string; ipAddress?: string; port?: number; linkedPcId?: number }) =>
    post<GameServerRow>('/api/admin/servers', dto),
  update:       (id: number, dto: { name: string; ipAddress?: string; port?: number; linkedPcId?: number }) =>
    put<GameServerRow>(`/api/admin/servers/${id}`, dto),
  toggle:       (id: number) => patch<{ id: number; isActive: boolean }>(`/api/admin/servers/${id}/toggle`, {}),
  regenToken:   (id: number) => patch<{ id: number; gsiToken: string; gsiUrl: string }>(`/api/admin/servers/${id}/regenerate-token`, {}),
  gsiConfig:    (id: number, host?: string) => {
    const p = host ? `?host=${encodeURIComponent(host)}` : '';
    return get<GsiConfigResponse>(`/api/admin/servers/${id}/gsi-config${p}`);
  },
  remove:       (id: number) => del<void>(`/api/admin/servers/${id}`),
  hardDelete:   (id: number) => del<{ id: number; deletedMatches: number; deletedVetoSeries: number }>(
    `/api/admin/servers/${id}/hard`),
};

/** POST GSI payload (for testing / simulator). */
export async function postGsi(token: string, payload: unknown): Promise<void> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const res = await fetch(`${API_BASE}/api/gsi/${token}`, {
    method: 'POST', headers, body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`GSI error ${res.status}`);
}

