import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { ResetPasswordInput } from '@/lib/schemas/auth.schema';
import { getApiErrorMessage } from '@/lib/api-error';
import { toast } from 'sonner';

export const useResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = useCallback(async (data: ResetPasswordInput) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email: data.email,
        otp: data.otp,
        newPassword: data.password,
      });

      toast.success('Đặt lại mật khẩu thành công!');

      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Mã OTP không đúng hoặc đã hết hạn.');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return { handleResetPassword, isLoading };
};
