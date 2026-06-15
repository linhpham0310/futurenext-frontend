'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label'; // [KẾ THỪA S1]
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/schemas/auth.schema';
import { useResetPassword } from '@/hooks/auth/useResetPassword';

export const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || ''; // Lấy email từ trang forgot gửi qua (nếu có)

  const { handleResetPassword, isLoading } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: emailFromUrl, otp: '', newPassword: '', confirmNewPassword: '' },
  });

  return (
    <form onSubmit={handleSubmit(handleResetPassword)} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          {...register('email')}
          id="email"
          type="email"
          disabled={!!emailFromUrl || isLoading}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="otp">Mã OTP (6 chữ số)</Label>
        <Input {...register('otp')} id="otp" placeholder="123456" disabled={isLoading} />
        {errors.otp && <p className="text-xs text-red-500">{errors.otp.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="newPassword">Mật khẩu mới</Label>
        <Input {...register('newPassword')} id="newPassword" type="password" disabled={isLoading} />
        {errors.newPassword && (
          <p className="text-xs text-red-1000">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu</Label>
        <Input
          {...register('confirmNewPassword')}
          id="confirmNewPassword"
          type="password"
          disabled={isLoading}
        />
        {errors.confirmNewPassword && (
          <p className="text-xs text-red-500">{errors.confirmNewPassword.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
      </Button>
    </form>
  );
};
