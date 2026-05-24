/**
 * @file Custom hook for handling user login form logic and authentication state.
 */
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/schemas/auth.schema';
import { authApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth hook to access store actions
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';

/**
 * Custom hook to manage the state and logic for the login form.
 * @returns {object} Form control methods, loading state, API error.
 */
export function useLogin() {
  const router = useRouter();
  const { login: storeLogin } = useAuth(); // Get the login action from the auth store hook
  const [apiError, setApiError] = useState<string | null>(null);

  // Initialize react-hook-form
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setApiError(null); // Clear previous errors
    console.log('Attempting login with:', { email: data.email }); // Log email only

    try {
      // Call the login API function
      const response = await authApi.login(data);
      console.log('Login API Success:', response);

      // Call the login action from the auth store to update global state
      storeLogin(response.accessToken, response.user);

      // Redirect to dashboard or intended page after successful login
      // TODO: Implement redirect logic based on user role or previous page
      const role = response.user.role;
      if (role === UserRole.ADMIN) {
        router.push('/admin/dashboard');
      } else if (role === UserRole.TEACHER) {
        router.push('/teacher/dashboard');
      } else {
        router.push('/dashboard'); // student
      }
    } catch (error: unknown) {
      const err = error as { message?: string; statusCode?: number };
      console.error('Login API Failed:', error);
      // Handle specific API errors (401, 403, 429...)
      if (err?.statusCode === 401) {
        // Unauthorized (wrong email/pass)
        setApiError(err.message || 'Email hoặc mật khẩu không chính xác.');
      } else if (err?.statusCode === 403) {
        // Forbidden (not verified, locked)
        setApiError(err.message || 'Tài khoản chưa kích hoạt hoặc bị khóa.');
      } else if (err?.statusCode === 429) {
        // Too Many Requests
        setApiError(err.message || 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.');
      } else {
        // Other errors
        setApiError(err.message || 'Đã xảy ra lỗi trong quá trình đăng nhập.');
      }
      // Clear password field on error for security
      form.setValue('password', '');
    }
  };

  return {
    form, // Form object
    onSubmit, // Submit handler
    isLoading: form.formState.isSubmitting, // Loading state
    apiError, // API error message
  };
}
