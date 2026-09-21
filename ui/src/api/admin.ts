import type { TournamentAdmin, TournamentFormData } from '../types/admin';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function adminHeaders(apiKey: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Admin-Key': apiKey,
  };
}

async function adminRequest<T>(
  path: string,
  apiKey: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...adminHeaders(apiKey), ...options?.headers },
  });

  if (!response.ok) {
    throw new Error(`Admin API error ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const adminApi = {
  getTournaments: (apiKey: string) =>
    adminRequest<TournamentAdmin[]>('/api/admin/tournaments', apiKey),

  getTournament: (apiKey: string, id: number) =>
    adminRequest<TournamentAdmin>(`/api/admin/tournaments/${id}`, apiKey),

  createTournament: (apiKey: string, data: TournamentFormData) =>
    adminRequest<number>('/api/admin/tournaments', apiKey, {
      method: 'POST',
      body: JSON.stringify(toPayload(data)),
    }),

  updateTournament: (apiKey: string, id: number, data: TournamentFormData) =>
    adminRequest<void>(`/api/admin/tournaments/${id}`, apiKey, {
      method: 'PUT',
      body: JSON.stringify(toPayload(data)),
    }),

  deleteTournament: (apiKey: string, id: number) =>
    adminRequest<void>(`/api/admin/tournaments/${id}`, apiKey, {
      method: 'DELETE',
    }),
};

function toPayload(data: TournamentFormData) {
  return {
    titleRu: data.titleRu,
    titleEn: data.titleEn,
    descriptionRu: data.descriptionRu,
    descriptionEn: data.descriptionEn,
    game: data.game,
    status: data.status,
    startDate: data.startDate,
    endDate: data.endDate || null,
    prizePool: data.prizePool,
    registrationUrl: data.registrationUrl,
    rulesUrl: data.rulesUrl,
    isFeatured: data.isFeatured,
  };
}
