import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api'; // [KẾ THỪA S1]
import { ResetPasswordInput } from '@/lib/schemas/auth.schema';
import { toast } from 'sonner';

export const useResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email: data.email,
        otp: data.otp,
        newPassword: data.password,
      });

      toast.success('Đặt lại mật khẩu thành công!');

      // Chờ 2s để người dùng đọc thông báo rồi chuyển hướng
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (err: unknown) {
      // apiClient interceptor rejects with { statusCode, message, error }
      const apiErr = err as { message?: string };
      toast.error(apiErr.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  return { handleResetPassword, isLoading };
};
