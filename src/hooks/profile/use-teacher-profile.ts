// [Task: S3-FE-01] Hook quản lý logic nộp và cập nhật Teacher Profile
import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface SubmitProfilePayload {
  bio: string;
  expertise: string[];
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export function useTeacherProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitProfile = async (payload: SubmitProfilePayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/teacher-profiles/submit', payload);
      return response.data;
    } catch (err: unknown) {
      const apiError = err as ApiError;

      const message = apiError.response?.data?.message || 'Lỗi khi nộp hồ sơ';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (payload: Partial<SubmitProfilePayload>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.put('/teacher-profiles/update', payload);
      return response.data;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const message = apiError.response?.data?.message || 'Lỗi khi cập nhật hồ sơ';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitProfile,
    updateProfile,
    isLoading,
    error,
  };
}
