import { createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '@services/auth.service';
import { loginStart, loginSuccess, loginFailure, markAuthInitialized, logout } from './auth.slice';
import type { LoginDto, RegisterDto } from '@services/auth.service';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const AUTH_HINT_KEY = 'devlog.auth.hint';

function setAuthHint() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_HINT_KEY, '1');
}

function clearAuthHint() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_HINT_KEY);
}

function hasAuthHint() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(AUTH_HINT_KEY) === '1';
}

async function getCurrentUserWithRetry(maxAttempts = 5): Promise<Awaited<ReturnType<typeof authApi.getCurrentUser>>> {
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await authApi.getCurrentUser();
    } catch (error: any) {
      lastError = error;
      const status = error?.response?.status;

      // Only retry on unauthorized because cookie/session might not be visible instantly.
      if (status !== 401 || attempt === maxAttempts) {
        throw error;
      }

      await sleep(120 * attempt);
    }
  }

  throw lastError;
}

function normalizeAuthError(error: any): string {
  const status = error?.response?.status;
  const message = error?.response?.data?.message ?? error?.message;

  if (status === 401) {
    return 'Session was not established. Please check frontend/backend URL config and try again.';
  }

  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string') return message;
  return 'Authentication failed';
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginDto, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loginStart());
      
      // Bước 1: Gọi API login (set cookie)
      await authApi.login(credentials);

      // Bước 2: Retry lấy user info để tránh race condition cookie propagation.
      const user = await getCurrentUserWithRetry();
      
      // Bước 4: Update Redux state
      setAuthHint();
      dispatch(loginSuccess(user));
      
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = normalizeAuthError(error);
      clearAuthHint();
      dispatch(loginFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async () => {
    // Triggers redirect - state will be restored via checkAuth on return
    setAuthHint();
    authApi.loginWithGoogle();
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: RegisterDto, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loginStart());

      await authApi.register(payload);

      // Register endpoint only creates account, then login to create session cookies.
      await authApi.login({
        email: payload.email,
        password: payload.password,
        remember: true,
      });

      const user = await getCurrentUserWithRetry();
      setAuthHint();
      dispatch(loginSuccess(user));

      return user;
    } catch (error: any) {
      console.error('Register error:', error);
      const errorMessage = normalizeAuthError(error);

      clearAuthHint();
      dispatch(loginFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  },
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthHint();
      dispatch(logout());
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { dispatch }) => {
    if (!hasAuthHint()) {
      dispatch(markAuthInitialized());
      return null;
    }

    try {
      const user = await authApi.getCurrentUser();
      setAuthHint();
      dispatch(loginSuccess(user));
      return user;
    } catch {
      clearAuthHint();
      dispatch(markAuthInitialized());
      return null;
    }
  }
);
