import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@app/store';

// User type đơn giản
export interface User {
  id: string;
  name: string | null;
  email?: string;
  username?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    
    loginSuccess(state, action: PayloadAction<User>) {
      state.loading = false;
      state.isAuthenticated = true;
      state.initialized = true;
      state.user = action.payload;
      state.error = null;
    },
    
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.isAuthenticated = false;
      state.initialized = true;
      state.user = null;
      state.error = action.payload;
    },
    
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.initialized = true;
      state.loading = false;
      state.error = null;
    },
    
    markAuthInitialized(state) {
      state.initialized = true;
      state.loading = false;
    },
    
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  markAuthInitialized,
  clearError,
} = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthInitialized = (state: RootState) => state.auth.initialized;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;

export const authReducer = authSlice.reducer;
