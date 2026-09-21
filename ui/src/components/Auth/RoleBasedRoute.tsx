import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { ReactNode } from 'react';

interface Props {
  roles:      string[];
  children:   ReactNode;
  redirectTo?: string;
}

export function RoleBasedRoute({ roles, children, redirectTo = '/' }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-bg">
        <span className="text-cyber-muted text-sm animate-pulse">Loading...</span>
      </div>
    );
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
