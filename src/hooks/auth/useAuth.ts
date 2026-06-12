// src/hooks/useAuth.ts
/**
 * @file Custom hook to conveniently access the authentication state and actions
 * from the useAuthStore.
 * Cập nhật Task S1-FE-08: Implement logic gọi API logout hoàn chỉnh.
 */
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AuthUser } from '@/types/auth.api';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();

  // Select specific parts of the state or actions needed
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const updateUser = useAuthStore((state) => state.updateUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Helper check role
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const isPendingTeacher = user?.teacherProfile?.status === 'PENDING';

  // Simplified login action
  const login = (token: string, userData: AuthUser) => {
    setAuth(userData, token);
  };

  /**
   * Hàm Logout hoàn chỉnh:
   * 1. Gọi API POST /auth/logout để thu hồi session backend
   * 2. Xóa state xác thực (Zustand + localStorage)
   * 3. Chuyển hướng về trang đăng nhập
   */
  const logout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    console.debug('[useAuth] Initiating logout process...');

    try {
      // Gọi API Logout (fire-and-forget)
      authApi.logout().catch((err) => {
        console.warn('[useAuth] Logout API call failed:', err?.message || err);
      });
    } catch (error) {
      console.warn('[useAuth] Error initiating logout API call:', error);
    } finally {
      // Xóa state client
      clearAuth();
      // Chuyển hướng về trang login
      router.replace('/sign-in');
      console.debug('[useAuth] Logout complete.');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = !isHydrated;

  return {
    isAuthenticated,
    user,
    accessToken,
    isAdmin,
    isTeacher,
    isStudent,
    isPendingTeacher,
    isLoading,
    login,
    logout,
    setUser: updateUser,
    setAccessToken,
    setAuth,
    clearAuth,
    updateUser,
    isLoggingOut,
  };
}
