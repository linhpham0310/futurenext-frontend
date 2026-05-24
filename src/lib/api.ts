// src/lib/api.ts
import axios from 'axios';
import { RegisterRequest, RegisterResponse } from '@/types/auth.api';
import { LoginFormData, VerifyEmailFormData } from './schemas/auth.schema';
import { AuthUser } from '@/types'; // Import AuthUser type

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
