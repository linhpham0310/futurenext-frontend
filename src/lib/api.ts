// src/lib/api.ts
import axios from 'axios';
import { RegisterRequest, RegisterResponse } from '@/types/auth.api';
import { VerifyEmailFormData } from './schemas/auth.schema';

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
};

// ... (usersApi...)
