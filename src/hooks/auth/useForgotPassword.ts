import { useState } from 'react';
import { apiClient } from '@/lib/api'; // [KẾ THỪA S1]
import { ForgotPasswordInput } from '@/lib/schemas/auth.schema';
import axios from 'axios';

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
      let message = 'Có lỗi xảy ra, vui lòng thử lại sau.';

      // Xử lý lỗi Rate Limit hoặc lỗi Server
      if (axios.isAxiosError(err)) {
        message =
          err.response?.status === 429
            ? 'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau 1 giờ.'
            : 'Có lỗi xảy ra, vui lòng thử lại sau.';
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleForgotPassword, isLoading, isSuccess, error };
};
