import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@app/hooks';
import { selectAuthInitialized, selectIsAuthenticated } from '@features/auth/auth.slice';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const initialized = useAppSelector(selectAuthInitialized);

  if (!initialized) {
    return null;
  }
  
  // Nếu chưa login → redirect về /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Đã login → render children
  return <>{children}</>;
}
