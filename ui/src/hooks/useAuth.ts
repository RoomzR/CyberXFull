import { useAuthContext } from '../contexts/AuthContext';

/**
 * Returns the current user, auth state and auth actions.
 */
export function useAuth() {
  return useAuthContext();
}
