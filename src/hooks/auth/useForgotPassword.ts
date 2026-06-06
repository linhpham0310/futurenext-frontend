import { useState } from 'react';
import { apiClient } from '@/lib/api'; // [KẾ THỪA S1]
import { ForgotPasswordInput } from '@/lib/schemas/auth.schema';

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleForgotPassword = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setError(null);
    try {
      // Gọi API đã triển khai ở Task S2-BE-01/03
      await apiClient.post('/auth/forgot-password', data);
      setIsSuccess(true);
    } catch (err: unknown) {
      // apiClient interceptor rejects with { statusCode, message, error }
      const apiErr = err as { statusCode?: number; message?: string };
      let message: string;

      if (apiErr.statusCode === 429) {
        message = 'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau 1 giờ.';
      } else {
        message = apiErr.message || 'Có lỗi xảy ra, vui lòng thử lại sau.';
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleForgotPassword, isLoading, isSuccess, error };
};
