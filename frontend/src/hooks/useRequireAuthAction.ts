import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@app/hooks';
import { selectIsAuthenticated } from '@features/auth/auth.slice';

export function useRequireAuthAction() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const requireAuthAction = useCallback(
    (onAuthenticated?: () => void) => {
      if (!isAuthenticated) {
        navigate('/login', {
          state: {
            from: `${location.pathname}${location.search}`,
          },
        });
        return false;
      }

      onAuthenticated?.();
      return true;
    },
    [isAuthenticated, location.pathname, location.search, navigate],
  );

  return {
    isAuthenticated,
    requireAuthAction,
  };
}

