// src/lib/api.ts
import axios from 'axios';
import { RegisterFormData } from '@/lib/schemas/auth.schema';
import { RegisterRequest, RegisterResponse } from '@/types/auth.api';
// ... (VerifyEmailFormData import...)

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

  //verifyEmail: async (data: any /* VerifyEmailFormData */): Promise<{ message: string }> => { /* ... */ }, // Sẽ dùng ở S1-FE-03

  // login: async (data: any): Promise<any> => { /* ... */ }, // Sẽ dùng ở sprint sau
};

// ... (usersApi...)
