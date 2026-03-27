import apiClient from '@services/api';

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
    const response = await apiClient.get('/users/me');
    return response.data;
  },
};

export interface LoginDto {
  email: string;
  password: string;
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
  email?: string;
  username?: string;
}
