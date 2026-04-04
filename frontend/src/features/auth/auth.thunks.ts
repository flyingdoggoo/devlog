import { createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '@services/auth.service';
import { loginStart, loginSuccess, loginFailure, markAuthInitialized, logout } from './auth.slice';
import type { LoginDto, RegisterDto } from '@services/auth.service';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
      dispatch(loginSuccess(user));
      
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async () => {
    // Triggers redirect - state will be restored via checkAuth on return
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
      dispatch(loginSuccess(user));

      return user;
    } catch (error: any) {
      console.error('Register error:', error);
      const message = error.response?.data?.message;
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message || error.message || 'Register failed';

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
      dispatch(logout());
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { dispatch }) => {
    try {
      const user = await authApi.getCurrentUser();
      dispatch(loginSuccess(user));
      return user;
    } catch {
      dispatch(markAuthInitialized());
      return null;
    }
  }
);
