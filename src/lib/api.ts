// src/lib/api.ts (Phiên bản hoàn chỉnh)
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthUser, RegisterRequest, RegisterResponse } from '@/types/auth.api';
import { LoginFormData, VerifyEmailFormData } from './schemas/auth.schema';
import { useAuthStore } from '@/store/authStore';
import { UpdateProfileFormData } from './schemas/user.schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, //  Giữ lại - quan trọng cho refresh token cookie
  timeout: 10000,
});

// Types
interface LoginSuccessResponse {
  accessToken: string;
  user: AuthUser;
}

interface ErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (reason?: Error | AxiosError) => void;
}

//  Thêm function lấy token từ localStorage
const getAccessToken = (): string | null => {
  // Ưu tiên lấy từ Zustand store trước
  const storeToken = useAuthStore.getState().accessToken;
  if (storeToken) return storeToken;

  // Fallback sang localStorage
  return localStorage.getItem('accessToken');
};

//  Thêm function lưu token (sync cả Zustand và localStorage)
const setAccessToken = (token: string) => {
  useAuthStore.getState().setAccessToken(token);
};

// --- Axios Request Interceptor ---
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    //  Dùng function mới
    const accessToken = getAccessToken();

    const publicRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
    ];
    const isRefreshRequest = config.url === '/auth/refresh';

    if (
      accessToken &&
      config.headers &&
      !publicRoutes.includes(config.url || '') &&
      !isRefreshRequest
    ) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.debug('[API Request] Added Authorization header.');
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error Interceptor]', error);
    return Promise.reject(error);
  }
);

// --- Axios Response Interceptor ---
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const url = originalRequest.url;

    console.debug(`[API Response Error] Status: ${status}, URL: ${url}`);

    if (status === 401 && url !== '/auth/refresh' && !originalRequest._retry) {
      if (isRefreshing) {
        console.debug('Token refresh in progress, queueing request:', originalRequest.url);
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      console.log('Access token expired or invalid. Attempting refresh...');

      try {
        const refreshResponse = await authApi.refreshToken();
        const newAccessToken = refreshResponse.accessToken;
        console.log('Token refresh successful!');

        //  Dùng function mới để sync
        setAccessToken(newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError as AxiosError, null);

        //  Clear cả Zustand và localStorage
        useAuthStore.getState().clearAuth();
        localStorage.removeItem('accessToken');

        console.error('User logged out due to refresh failure.');

        //  Chuyển hướng về login
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }

        return Promise.reject(refreshError || error);
      } finally {
        isRefreshing = false;
      }
    }

    const responseData = error.response?.data as ErrorResponse | undefined;
    const simplifiedError = error.response?.data
      ? {
          statusCode: error.response.status,
          message: responseData?.message || `Lỗi ${error.response.status}`,
          error: responseData?.error || 'Error',
        }
      : {
          message: error.message || 'Lỗi không xác định.',
        };
    return Promise.reject(simplifiedError);
  }
);

// --- Auth API Calls ---
export const authApi = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailFormData): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/verify-email', data);
    return response.data;
  },

  resendOtp: async (data: { email: string }): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/resend-otp', data);
    return response.data;
  },

  login: async (data: LoginFormData): Promise<LoginSuccessResponse> => {
    const response = await apiClient.post<LoginSuccessResponse>('/auth/login', data);
    //  Lưu token sau khi login thành công
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/logout');
    //  Clear token khi logout
    localStorage.removeItem('accessToken');
    useAuthStore.getState().clearAuth();
    return response.data;
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<{ accessToken: string }>(
      '/auth/refresh',
      {},
      { withCredentials: true }
    );
    return response.data;
  },
};

// --- Users API ---
export const usersApi = {
  getProfile: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>('/me/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileFormData): Promise<AuthUser> => {
    const response = await apiClient.put<AuthUser>('/me/profile', data);
    return response.data;
  },
};
