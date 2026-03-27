import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Checkbox } from '@components/ui/Checkbox';
import { SocialButton } from '@components/ui/SocialButton';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { login, loginWithGoogle } from '@features/auth/auth.thunks';
import { clearError, selectIsAuthenticated, selectAuthLoading, selectAuthError } from '@features/auth/auth.slice';

export function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Select từ Redux state
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  // Redirect nếu đã login
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, redirecting to home...');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log('Submitting login form...');
    
    // Dispatch login action
    const result = await dispatch(login({
      email: formData.email,
      password: formData.password,
      remember: formData.remember,
    }));
    
    // Check nếu login thành công
    if (login.fulfilled.match(result)) {
      console.log('Login fulfilled, user:', result.payload);
      // State sẽ tự động update, useEffect sẽ redirect
    } else {
      console.log('Login rejected:', result.error.message);
    }
  };

  const handleSocialLogin = (provider: 'github' | 'google') => {
    console.log('Social login with:', provider);
    
    if (provider === 'google') {
      dispatch(loginWithGoogle());
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleCreateAccount = () => {
    navigate('/register');
  };

  const handleInputChange = () => {
    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <Card className="w-full max-w-[420px] mx-auto">
      <CardContent className="p-8">
        {/* Tabs */}
        <div className="flex w-full border-b border-[#333333] mb-8 relative">
          <button className="w-1/2 pb-3 text-white text-sm font-medium relative text-center">
            Sign In
            <span className="absolute bottom-0 left-0 w-[100%] h-0.5 bg-white"></span>
          </button>
          <button
            onClick={handleCreateAccount}
            className="w-1/2 pb-3 text-gray-500 hover:text-gray-300 transition-colors text-sm font-medium text-center"
          >
            Create Account
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              handleInputChange();
            }}
            required
          />

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="password" className="block text-xs font-medium text-gray-300">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[10px] font-semibold text-[#0ea5e9] hover:text-blue-400 tracking-wider uppercase"
              >
                FORGOT?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                handleInputChange();
              }}
              required
            />
          </div>

          {/* Remember Me */}
          <Checkbox
            id="remember"
            label="Remember this session"
            checked={formData.remember}
            onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
          />

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-xs text-center bg-red-500/10 py-2 px-4 rounded">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Access Workspace'}
          </Button>

          {/* Divider */}
          <div className="relative py-4 flex items-center">
            <div className="flex-grow border-t border-[#333333]"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-[10px] font-semibold tracking-wider">
              OR
            </span>
            <div className="flex-grow border-t border-[#333333]"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <SocialButton 
              provider="github" 
              onClick={() => handleSocialLogin('github')} 
            />
            <SocialButton 
              provider="google" 
              onClick={() => handleSocialLogin('google')} 
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
