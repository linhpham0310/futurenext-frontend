/**
 * @file Custom hook for handling user login form logic and authentication state.
 */
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/schemas/auth.schema';
import { authApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth'; // chỉ dùng để lấy storeLogin và state
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/auth.api';

export function useLogin() {
  const router = useRouter();
  const { login: storeLogin, isAuthenticated, user } = useAuth(); // lấy từ useAuth (đã có sẵn)
  const [apiError, setApiError] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false); // cờ để trì hoãn redirect

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Khi form submit thành công, chỉ gọi API và set cờ
  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setApiError(null);
    try {
      const response = await authApi.login(data);
      storeLogin(response.accessToken, response.user); // cập nhật store
      setShouldRedirect(true); // báo hiệu cần redirect
    } catch (error: unknown) {
      const err = error as { message?: string; statusCode?: number };
      if (err?.statusCode === 401) {
        setApiError(err.message || 'Email hoặc mật khẩu không chính xác.');
      } else if (err?.statusCode === 403) {
        setApiError(err.message || 'Tài khoản chưa kích hoạt hoặc bị khóa.');
      } else if (err?.statusCode === 429) {
        setApiError(err.message || 'Bạn đã thử quá nhiều lần.');
      } else {
        setApiError(err.message || 'Đã xảy ra lỗi.');
      }
      form.setValue('password', '');
      setShouldRedirect(false);
    }
  };

  // Effect này chạy khi isAuthenticated và user đã sẵn sàng, và có cờ redirect
  useEffect(() => {
    if (shouldRedirect && isAuthenticated && user) {
      const role = user.role;
      if (role === UserRole.ADMIN) {
        router.replace('/admin/dashboard');
      } else if (role === UserRole.TEACHER) {
        router.replace('/teacher/dashboard');
      } else {
        router.replace('/dashboard');
      }
      setShouldRedirect(false); // reset cờ
    }
  }, [shouldRedirect, isAuthenticated, user, router]);

  return {
    form,
    onSubmit,
    isLoading: form.formState.isSubmitting,
    apiError,
  };
}
