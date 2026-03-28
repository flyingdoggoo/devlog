import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Không cần baseURL vì đã có proxy trong vite.config.ts
// /api → tự động proxy đến http://localhost:3000/api

export const apiClient = axios.create({
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
