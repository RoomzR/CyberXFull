import type { AuthUser } from '../services/authApi';
import { useAuth } from './useAuth';

type Role = AuthUser['role'];

/**
 * Checks whether the current user has one of the given roles.
 * Returns false if the user is not authenticated.
 */
export function useRole(...roles: Role[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return roles.length === 0 || roles.includes(user.role);
}

export function useIsAdmin():   boolean { return useRole('Admin'); }
export function useIsManager(): boolean { return useRole('Admin', 'Manager'); }
export function useIsPlayer():  boolean { return useRole('Player'); }
