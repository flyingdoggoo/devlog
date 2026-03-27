export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  sessionId?: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    username: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string | null;
    email?: string;
    username?: string;
  } | null;
  loading: boolean;
  error: string | null;
}
