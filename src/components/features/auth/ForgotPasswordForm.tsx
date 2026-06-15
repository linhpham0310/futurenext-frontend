'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ForgotPasswordInput, forgotPasswordSchema } from '@/lib/schemas/auth.schema';
import { useForgotPassword } from '@/hooks/auth/useForgotPassword';

export const ForgotPasswordForm = () => {
  const { handleForgotPassword, isLoading, isSuccess, error } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  if (isSuccess) {
    return (
      <Alert variant="success">
        <AlertDescription>
          Nếu email tồn tại trong hệ thống, chúng tôi đã gửi mã xác thực (OTP) tới đó. Vui lòng kiểm
          tra hộp thư.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input
          {...register('email')}
          type="email"
          placeholder="name@example.com"
          disabled={isLoading}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
      </Button>
    </form>
  );
};
