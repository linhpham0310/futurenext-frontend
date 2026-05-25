// src/lib/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { RegisterRequest, RegisterResponse } from '@/types/auth.api';
import { LoginFormData, VerifyEmailFormData } from './schemas/auth.schema';
import { AuthUser } from '@/types'; // Import AuthUser type
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

/**
 * Axios instance dùng chung cho toàn app
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // BẮT BUỘC cho refresh token (HttpOnly cookie)
  timeout: 10000,
});

// --- Auth API Response Types ---
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

// --- Axios Request Interceptor ---
// Tự động thêm Access Token vào header Authorization
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ Zustand store
    const accessToken = useAuthStore.getState().accessToken;
    // Không thêm token cho các route public (login, register, forgot, reset, verify)
    const publicRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
    ];
    // Không thêm token cho chính request refresh
    const isRefreshRequest = config.url === '/auth/refresh';

    if (
      accessToken &&
      config.headers &&
      !publicRoutes.includes(config.url || '') &&
      !isRefreshRequest
    ) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.debug('[API Request] Added Authorization header.'); // Log khi dev
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error Interceptor]', error);
    return Promise.reject(error);
  }
);

// --- Axios Response Interceptor ---
// Xử lý lỗi 401 và tự động refresh token
let isRefreshing = false; // Cờ để tránh gọi refresh lặp lại
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
  (response) => {
    // Nếu response thành công, trả về
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }; // Thêm cờ _retry
    const status = error.response?.status;
    const url = originalRequest.url;

    console.debug(`[API Response Error] Status: ${status}, URL: ${url}`);

    // Chỉ xử lý lỗi 401 Unauthorized VÀ không phải từ API refresh VÀ chưa thử retry
    if (status === 401 && url !== '/auth/refresh' && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, đẩy request lỗi vào hàng đợi
        console.debug('Token refresh in progress, queueing request:', originalRequest.url);
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
            }
            return apiClient(originalRequest); // Thử lại request với token mới từ queue
          })
          .catch((err) => {
            return Promise.reject(err); // Propagate error if refresh failed
          });
      }

      // Đánh dấu đang refresh và đánh dấu request này đã thử retry
      originalRequest._retry = true;
      isRefreshing = true;
      console.log('Access token expired or invalid. Attempting refresh...');

      try {
        // Gọi API refresh token (không cần try-catch ở đây vì authApi.refreshToken đã xử lý)
        const refreshResponse = await authApi.refreshToken();
        const newAccessToken = refreshResponse.accessToken;
        console.log('Token refresh successful!');

        // Cập nhật token mới vào Zustand store
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Cập nhật header của request gốc
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }

        // Thực thi lại các request trong hàng đợi với token mới
        processQueue(null, newAccessToken);

        // Thử lại request gốc với token mới
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        console.error('Token refresh failed:', refreshError);
        // Nếu refresh thất bại (lỗi 401 hoặc lỗi khác)
        // Thực thi queue với lỗi
        processQueue(refreshError as AxiosError, null);
        // Logout người dùng
        useAuthStore.getState().clearAuthData(); // Xóa state
        // Chuyển hướng về trang login (cần thực hiện ở component hoặc global handler)
        // window.location.href = '/sign-in'; // Cách đơn giản nhất, hoặc dùng router nếu có thể truy cập
        console.error('User logged out due to refresh failure.');
        // Ném lỗi gốc hoặc lỗi refresh để component cha xử lý (nếu cần)
        return Promise.reject(refreshError || error);
      } finally {
        isRefreshing = false; // Reset cờ sau khi hoàn tất
      }
    }

    const responseData = error.response?.data as ErrorResponse | undefined;
    // Trích xuất lỗi từ response data nếu có
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
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  /**
   * Refresh Access Token (dùng HttpOnly cookie)
   */
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<{ accessToken: string }>(
      '/auth/refresh',
      {},
      { withCredentials: true }
    );
    return response.data;
  },
};
