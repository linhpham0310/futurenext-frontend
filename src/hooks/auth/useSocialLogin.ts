// src/hooks/auth/useSocialLogin.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';

export function useSocialLogin() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const loginWith = (provider: 'google' | 'apple' | 'facebook') => {
    authApi.loginWithSocial(provider);
  };

  const handleCallback = async (accessToken: string) => {
    setIsLoading(true);
    try {
      const user = await authApi.handleSocialCallback(accessToken);
      setUser(user);
      // Redirect dựa trên role
      const role = user.role;
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'teacher') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Social login failed:', error);
      router.push('/login?error=social_login_failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWith, handleCallback, isLoading };
}
