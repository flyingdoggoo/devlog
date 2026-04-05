import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Production: set VITE_API_BASE_URL (e.g. https://devlog-api.onrender.com)
// Local dev: keep empty to use Vite proxy '/api' -> localhost backend.
const rawApiBase = import.meta.env.VITE_API_BASE_URL ?? '';

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

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        error ? reject(error) : resolve(undefined);
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ message: string }>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const requestUrl = originalRequest?.url ?? '';
    const isAuthRefreshRequest = /\/auth\/refresh(?:$|\?)/i.test(requestUrl);

    if (error.response?.status !== 401 || originalRequest._retry || isAuthRefreshRequest) {
            return Promise.reject(error);
        }

        // Nếu đang refresh rồi, queue request lại thay vì gọi refresh song song
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => apiClient(originalRequest))
              .catch(Promise.reject);
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const baseURL = (apiClient.defaults.baseURL ?? '').replace(/\/+$/, '');
          const refreshUrl = baseURL ? `${baseURL}/auth/refresh` : '/api/auth/refresh';

          // Use a raw axios call here to avoid interceptor recursion on 401.
          await axios.post(refreshUrl, undefined, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          });
            processQueue(null);
            return apiClient(originalRequest); // retry request gốc
        } catch (refreshError) {
            processQueue(refreshError as AxiosError);
            window.dispatchEvent(new CustomEvent('auth:unauthorized')); // redirect login
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default apiClient;
