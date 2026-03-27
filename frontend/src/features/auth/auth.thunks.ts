import { createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '@services/auth.service';
import { loginStart, loginSuccess, loginFailure, markAuthInitialized, logout } from './auth.slice';
import type { LoginDto } from '@services/auth.service';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginDto, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loginStart());
      
      // Bước 1: Gọi API login (set cookie)
      await authApi.login(credentials);
      
      // Bước 2: Đợi một chút để cookie được set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Bước 3: Gọi API lấy user info (với cookie đã set)
      const user = await authApi.getCurrentUser();
      
      // Bước 4: Update Redux state
      console.log('Login successful, user:', user);
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
  async (_, { dispatch }) => {
    try {
      dispatch(loginStart());
      // Google OAuth sẽ redirect, không cần await
      authApi.loginWithGoogle();
    } catch (error: any) {
      const errorMessage = error.message || 'Google login failed';
      dispatch(loginFailure(errorMessage));
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await authApi.logout();
      dispatch(logout());
    } catch (error) {
      console.error('Logout error:', error);
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
