'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label'; // [KẾ THỪA S1]
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResetPasswordSchema, ResetPasswordInput } from '@/lib/schemas/auth.schema';
import { useResetPassword } from '@/hooks/auth/useResetPassword';

export const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || ''; // Lấy email từ trang forgot gửi qua (nếu có)

  const { handleResetPassword, isLoading } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { email: emailFromUrl },
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
        <Label htmlFor="password">Mật khẩu mới</Label>
        <Input {...register('password')} id="password" type="password" disabled={isLoading} />
        {errors.password && <p className="text-xs text-red-1000">{errors.password.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
        <Input
          {...register('confirmPassword')}
          id="confirmPassword"
          type="password"
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
      </Button>
    </form>
  );
};
