const API_BASE = import.meta.env.VITE_API_URL ?? '';

function getHeaders(locale: string): HeadersInit {
  return {
    Accept: 'application/json',
    'Accept-Language': locale,
  };
}

async function request<T>(path: string, locale: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: getHeaders(locale),
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${path}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getHome: (locale: string) => request<import('../types/api').HomePage>('/api/club/home', locale),
  getClub: (locale: string) => request<import('../types/api').ClubInfo>('/api/club', locale),
  getTournaments: (locale: string) =>
    request<import('../types/api').Tournament[]>('/api/tournaments', locale),
  getTeams: (locale: string, limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return request<import('../types/api').Team[]>(`/api/teams${query}`, locale);
  },
  getEvents: (locale: string, limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return request<import('../types/api').ClubEvent[]>(`/api/events${query}`, locale);
  },
  getFaq: (locale: string) => request<import('../types/api').FaqItem[]>('/api/faq', locale),
};
