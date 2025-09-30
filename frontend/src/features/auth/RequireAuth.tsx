import { useAppSelector } from '../../hooks/index.ts';
import { Navigate, useLocation } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

export function RequireAuth({ children }: PropsWithChildren) {
  const token = useAppSelector((s) => s.auth.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
