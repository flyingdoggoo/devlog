import apiClient from '@services/api';
import type { ApiResponse } from '../types/api';

export const authApi = {
  // Backend route: /auth/login (không có /api prefix)
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;  // Backend trả về empty object sau khi set cookie
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  loginWithGoogle: async (): Promise<void> => {
    // Redirect đến backend Google OAuth
    window.location.href = '/auth/google';
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<BackendMeResponse>>('/users/me');
    const raw = response.data.data;
    const credential = raw.credentials?.[0];

    return {
      id: raw.id,
      name: raw.name,
      avatarUrl: raw.avatarUrl ?? null,
      email: credential?.email,
      username: raw.username,
    };
  },
};

export interface LoginDto {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  ok?: boolean;
  user?: User;
  data?: {
    user?: User;
  };
}

export interface User {
  id: string;
  name: string | null;
  avatarUrl?: string | null;
  email?: string;
  username?: string;
}

interface BackendMeResponse {
  id: string;
  name: string | null;
  username: string;
  avatarUrl?: string | null;
  credentials?: Array<{
    email?: string;
  }>;
}
