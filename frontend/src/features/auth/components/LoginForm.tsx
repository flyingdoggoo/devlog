import { useState, FormEvent, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Checkbox } from '@components/ui/Checkbox';
import { SocialButton } from '@components/ui/SocialButton';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { login, register, loginWithGoogle } from '@features/auth/auth.thunks';
import {
  clearError,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '@features/auth/auth.slice';

type AuthLocationState = {
  from?: string;
};

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isRegisterMode = location.pathname === '/register';
  const from = (location.state as AuthLocationState | null)?.from;
  const safeRedirect = from && from !== '/login' && from !== '/register' ? from : '/';

  const [localError, setLocalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    remember: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(safeRedirect, { replace: true });
    }
  }, [isAuthenticated, navigate, safeRedirect]);

  useEffect(() => {
    setLocalError(null);
    dispatch(clearError());
  }, [dispatch, isRegisterMode]);

  const onFieldChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (localError) setLocalError(null);
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isRegisterMode) {
      if (!formData.username.trim()) {
        setLocalError('Username is required');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }

      const result = await dispatch(
        register({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      );

      if (register.rejected.match(result)) {
        console.log('Register rejected:', result.error?.message ?? 'Unknown error');
      }

      return;
    }

    const result = await dispatch(
      login({
        email: formData.email.trim(),
        password: formData.password,
        remember: formData.remember,
      }),
    );

    if (login.rejected.match(result)) {
      console.log('Login rejected:', result.error?.message ?? 'Unknown error');
    }
  };

  const handleSocialLogin = (provider: 'github' | 'google') => {
    if (provider === 'google') {
      dispatch(loginWithGoogle());
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const displayError = localError || error;

  return (
    <Card className="w-full max-w-[420px] mx-auto">
      <CardContent className="p-8">
        <div className="flex w-full border-b border-[#333333] mb-8 relative">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className={`w-1/2 pb-3 text-sm font-medium relative text-center transition-colors ${
              isRegisterMode ? 'text-gray-500 hover:text-gray-300' : 'text-white'
            }`}
          >
            Sign In
            {!isRegisterMode && (
              <span className="absolute bottom-0 left-0 w-[100%] h-0.5 bg-white" />
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className={`w-1/2 pb-3 text-sm font-medium relative text-center transition-colors ${
              isRegisterMode ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Create Account
            {isRegisterMode && (
              <span className="absolute bottom-0 left-0 w-[100%] h-0.5 bg-white" />
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegisterMode && (
            <Input
              id="username"
              type="text"
              label="Username"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => onFieldChange('username', e.target.value)}
              required
            />
          )}

          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => onFieldChange('email', e.target.value)}
            required
          />

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="password" className="block text-xs font-medium text-gray-300">
                Password
              </label>
              {!isRegisterMode && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] font-semibold text-[#0ea5e9] hover:text-blue-400 tracking-wider uppercase"
                >
                  FORGOT?
                </button>
              )}
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => onFieldChange('password', e.target.value)}
              required
            />
          </div>

          {isRegisterMode && (
            <Input
              id="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => onFieldChange('confirmPassword', e.target.value)}
              required
            />
          )}

          {!isRegisterMode && (
            <Checkbox
              id="remember"
              label="Remember this session"
              checked={formData.remember}
              onChange={(e) => onFieldChange('remember', e.target.checked)}
            />
          )}

          {displayError && (
            <div className="text-red-500 text-xs text-center bg-red-500/10 py-2 px-4 rounded">
              {displayError}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full py-2.5" disabled={loading}>
            {loading
              ? isRegisterMode
                ? 'Creating account...'
                : 'Signing in...'
              : isRegisterMode
                ? 'Create Account'
                : 'Access Workspace'}
          </Button>

          <div className="relative py-4 flex items-center">
            <div className="flex-grow border-t border-[#333333]" />
            <span className="flex-shrink-0 mx-4 text-gray-500 text-[10px] font-semibold tracking-wider">
              OR
            </span>
            <div className="flex-grow border-t border-[#333333]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SocialButton provider="github" onClick={() => handleSocialLogin('github')} />
            <SocialButton provider="google" onClick={() => handleSocialLogin('google')} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

