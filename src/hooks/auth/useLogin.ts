// src/hooks/auth/useLogin.ts
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/schemas/auth.schema';
import { authApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/auth.api';

export function useLogin() {
  const router = useRouter();
  const { login: storeLogin } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setApiError(null);
    try {
      const response = await authApi.login(data);
      storeLogin(response.accessToken, response.user);
      const role = (response.user.role as string)?.toUpperCase();
      if (role === UserRole.ADMIN) {
        router.push('/admin/dashboard');
      } else if (role === UserRole.TEACHER) {
        router.push('/teacher/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { message?: string; statusCode?: number };
      if (err?.statusCode === 401) {
        setApiError(err.message || 'Email hoặc mật khẩu không chính xác.');
      } else if (err?.statusCode === 403) {
        setApiError(err.message || 'Tài khoản chưa kích hoạt hoặc bị khóa.');
      } else if (err?.statusCode === 429) {
        setApiError(err.message || 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.');
      } else {
        setApiError(err.message || 'Đã xảy ra lỗi trong quá trình đăng nhập.');
      }
      form.setValue('password', '');
    }
  };

  return {
    form,
    onSubmit,
    isLoading: form.formState.isSubmitting,
    apiError,
  };
}
