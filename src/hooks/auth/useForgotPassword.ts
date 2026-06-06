import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { ForgotPasswordInput } from '@/lib/schemas/auth.schema';
import { getApiErrorMessage, getApiErrorStatus } from '@/lib/api-error';

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleForgotPassword = useCallback(async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/forgot-password', data);
      setIsSuccess(true);
    } catch (err: unknown) {
      const status = getApiErrorStatus(err);
      const message =
        status === 429
          ? 'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau 1 giờ.'
          : getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại sau.');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { handleForgotPassword, isLoading, isSuccess, error };
};
