// [Task: S3-FE-01] Hook quản lý logic nộp và cập nhật Teacher Profile
import { useState, useCallback } from 'react';
import { apiClient, teacherProfilesApi } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';

interface SubmitProfilePayload {
  bio: string;
  expertise: string[];
}

export function useTeacherProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitProfile = useCallback(async (payload: SubmitProfilePayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/teacher-profiles/submit', payload);
      return response.data;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Lỗi khi nộp hồ sơ');
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (payload: Partial<SubmitProfilePayload>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.put('/teacher-profiles/update', payload);
      return response.data;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Lỗi khi cập nhật hồ sơ');
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMyProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await teacherProfilesApi.getMyProfile();
      return response.data;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    submitProfile,
    updateProfile,
    getMyProfile,
    isLoading,
    error,
  };
}
