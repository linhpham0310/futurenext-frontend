// src/hooks/auth/useLogin.ts
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/schemas/auth.schema';
import { authApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/auth.api';

export function useLogin() {
  const router = useRouter();
  const { login: storeLogin, isAuthenticated, user } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setApiError(null);
    try {
      const response = await authApi.login(data);
      storeLogin(response.accessToken, response.user); // cập nhật store
      setShouldRedirect(true); // báo hiệu cần redirect
    } catch (error: unknown) {
      const err = error as { message?: string; statusCode?: number };
      setApiError(err.message || 'Đăng nhập thất bại');
      form.setValue('password', '');
    }
  };

  useEffect(() => {
    if (shouldRedirect && isAuthenticated && user) {
      setShouldRedirect(false); // reset trước
      const role = user.role;
      if (role === UserRole.ADMIN) {
        router.replace('/admin/dashboard');
      } else if (role === UserRole.TEACHER) {
        router.replace('/teacher/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [shouldRedirect, isAuthenticated, user, router]);

  return {
    form,
    onSubmit,
    isLoading: form.formState.isSubmitting,
    apiError,
  };
}
