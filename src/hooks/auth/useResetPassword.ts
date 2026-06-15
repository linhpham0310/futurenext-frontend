import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import axios from 'axios';

export interface ResetPasswordFormValues {
  email: string;
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const useResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });
      toast.success('Đặt lại mật khẩu thành công!');
      setTimeout(() => router.push('/sign-in'), 2000);
    } catch (err: unknown) {
      let msg = 'Mã OTP không đúng hoặc đã hết hạn.';
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleResetPassword, isLoading };
};
