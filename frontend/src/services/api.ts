import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Production: set VITE_API_BASE_URL (e.g. https://devlog-api.onrender.com)
// Local dev: keep empty to use Vite proxy '/api' -> localhost backend.
const rawApiBase = import.meta.env.VITE_API_BASE_URL ?? '';

// Normalize to avoid double prefix:
// - https://api.onrender.com     -> https://api.onrender.com/api
// - https://api.onrender.com/api -> https://api.onrender.com/api
const normalizedBase = rawApiBase.trim().replace(/\/+$/, '').replace(/\/api$/i, '');

export const apiClient = axios.create({
  baseURL: normalizedBase ? `${normalizedBase}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Token stored in HttpOnly cookie, no need to add manually
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string }>) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login or refresh token
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
