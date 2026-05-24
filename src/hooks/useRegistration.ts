/**
 * @file Custom hook for handling user registration form logic, API calls, and state management.
 */
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form'; // Import SubmitHandler
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/lib/schemas/auth.schema';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation'; // Thường không cần chuyển hướng ngay sau register

/**
 * Custom hook to manage the state and logic for the registration form.
 * @returns {object} Form control methods, loading state, API error, and success state.
 */
export function useRegistration() {
  const router = useRouter(); // Có thể dùng để chuyển hướng nếu cần
  const [apiError, setApiError] = useState<string | null>(null); // State for general API errors
  const [isSuccess, setIsSuccess] = useState<boolean>(false); // State for success message display

  // Initialize react-hook-form with Zod schema validation
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      // Set initial form values
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '', // Initialize confirmPassword
      consentAccepted: false,
      role: 'student', //  thêm
    },
  });

  // Function to handle form submission
  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    setApiError(null); // Clear previous errors
    setIsSuccess(false);
    // Logging form data (remove sensitive data like password in production logs)
    console.log('Attempting registration with:', { fullName: data.fullName, email: data.email });

    const payload = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword, // ← PHẢI CÓ
      agreeTerms: data.consentAccepted, // 🔥 mapping QUAN TRỌNG
      role: data.role, //  thêm
    };

    try {
      // Call the registration API function
      const response = await authApi.register(payload);
      console.log('Registration API Success:', response);
      setIsSuccess(true); // Set success state
      form.reset(); // Clear form fields after successful submission

      // Optional: Redirect after a delay or simply display success message
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }, 3000);
    } catch (error: any) {
      console.error('Registration API Failed:', error);
      // Handle specific API errors
      if (error?.statusCode === 409) {
        // Conflict - Email exists
        form.setError('email', {
          type: 'server',
          message: error.message || 'Email này đã tồn tại.',
        });
      } else if (error?.statusCode === 429) {
        // Too Many Requests
        setApiError('Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.');
      } else {
        // Other errors (validation from server, 500, network error)
        setApiError(error.message || 'Đã xảy ra lỗi không mong muốn trong quá trình đăng ký.');
      }
    }
  };

  return {
    form, // The form object from react-hook-form
    onSubmit, // The submit handler function
    isLoading: form.formState.isSubmitting, // Loading state from react-hook-form
    apiError, // General API error message
    isSuccess, // Success state flag
  };
}
