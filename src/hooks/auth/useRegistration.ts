/**
 * @file Custom hook for handling user registration form logic, API calls, and state management.
 */
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/lib/schemas/auth.schema';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { getApiErrorMessage, getApiErrorStatus } from '@/lib/api-error';

/**
 * Custom hook to manage the state and logic for the registration form.
 */
export function useRegistration() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      consentAccepted: false,
      role: 'student',
    },
  });

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    setApiError(null);
    setIsSuccess(false);

    const payload = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      agreeTerms: data.consentAccepted,
      role: data.role,
    };

    try {
      await authApi.register(payload);
      setIsSuccess(true);
      form.reset();

      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }, 3000);
    } catch (error: unknown) {
      const status = getApiErrorStatus(error);

      if (status === 409) {
        form.setError('email', {
          type: 'server',
          message: getApiErrorMessage(error, 'Email này đã tồn tại.'),
        });
      } else if (status === 429) {
        setApiError('Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.');
      } else {
        setApiError(getApiErrorMessage(error, 'Đã xảy ra lỗi không mong muốn trong quá trình đăng ký.'));
      }
    }
  };

  return {
    form,
    onSubmit,
    isLoading: form.formState.isSubmitting,
    apiError,
    isSuccess,
  };
}
