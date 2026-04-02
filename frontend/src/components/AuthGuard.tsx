import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@app/hooks';
import { selectAuthInitialized, selectIsAuthenticated } from '@features/auth/auth.slice';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const initialized = useAppSelector(selectAuthInitialized);
  const location = useLocation();

  if (!initialized) {
    return null;
  }
  
  // Nếu chưa login → redirect về /login
  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }
  
  // Đã login → render children
  return <>{children}</>;
}
