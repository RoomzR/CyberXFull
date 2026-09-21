const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface AuthUser {
  id:       number;
  email:    string;
  username: string;
  role:     'Admin' | 'Manager' | 'Player';
}

export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  user:         AuthUser;
}

async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, string>;
    throw new Error(err['message'] ?? `Auth error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const authApi = {
  register: (email: string, username: string, password: string) =>
    post<AuthResponse>('/api/auth/register', { email, username, password }),

  login: (email: string, password: string) =>
    post<AuthResponse>('/api/auth/login', { email, password }),

  logout: (refreshToken: string) =>
    post<void>('/api/auth/logout', { token: refreshToken }),

  refresh: (token: string) =>
    post<AuthResponse>('/api/auth/refresh', { token }),

  me: async (accessToken: string): Promise<AuthUser> => {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Auth error ${res.status}`);
    return res.json() as Promise<AuthUser>;
  },
};
