// src/hooks/auth/useSocialLogin.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';

export function useSocialLogin() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const loginWith = useCallback((provider: 'google' | 'apple' | 'facebook') => {
    authApi.loginWithSocial(provider);
  }, []);

  const handleCallback = useCallback(
    async (accessToken: string) => {
      setIsLoading(true);
      try {
        const user = await authApi.handleSocialCallback(accessToken);
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));

        if (user.role.toLowerCase() === 'admin') {
          router.push('/admin/dashboard');
        } else if (user.role.toLowerCase() === 'teacher') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Social login failed:', error);
        router.push('/sign-in?error=social_login_failed');
      } finally {
        setIsLoading(false);
      }
    },
    [router, setUser]
  );

  return { loginWith, handleCallback, isLoading };
}
