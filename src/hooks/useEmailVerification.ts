/**
 * @file Custom hook for handling email verification logic using OTP. Reads email from URL query params.
 */
import { useState, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyEmailSchema, VerifyEmailFormData } from '@/lib/schemas/auth.schema';
import { authApi } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Custom hook to manage state and logic for the email verification page.
 * @returns {object} Form control, submit handler, loading state, error/success messages, and email from URL.
 */
export function useEmailVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Memoize the function to get email to prevent re-renders
  const getEmailFromUrl = useCallback(() => searchParams.get('email'), [searchParams]);
  const emailFromUrl = getEmailFromUrl();

  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false); // State for redirect countdown

  // Initialize form (only needs OTP field now)
  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Function to handle form submission
  const onSubmit: SubmitHandler<VerifyEmailFormData> = async (data) => {
    setApiError(null);
    setSuccessMessage(null);
    setIsRedirecting(false);

    // Ensure email is present in URL
    if (!emailFromUrl) {
      setApiError('Lỗi: Không tìm thấy địa chỉ email trong URL để xác minh.');
      return;
    }

    // Prepare data for API call
    const submissionData = { email: emailFromUrl, otp: data.otp };
    console.log('Submitting OTP verification:', submissionData);

    try {
      // Call verification API
      const response = await authApi.verifyEmail(submissionData);
      console.log('Verification API Success:', response);
      setSuccessMessage(
        response.message || 'Xác thực thành công! Đang chuyển đến trang đăng nhập...'
      );
      setIsRedirecting(true); // Start redirect state

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/sign-in');
      }, 3000);
    } catch (error: unknown) {
      const err = error as { message?: string; statusCode?: number };
      console.error('Verification API Failed:', error);
      // Set error message based on API response
      setApiError(err.message || 'Xác minh thất bại. Vui lòng thử lại.');
      form.reset(); // Clear OTP input on error
    }
  };

  return {
    form, // Form object
    onSubmit, // Submit handler
    isLoading: form.formState.isSubmitting || isRedirecting, // Show loading during submit or redirect wait
    apiError, // API error message
    successMessage, // API success message
    emailFromUrl, // Email read from URL
  };
}
