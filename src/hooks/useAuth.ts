// src/hooks/useAuth.ts
/**
 * @file Custom hook to conveniently access the authentication state and actions
 * from the useAuthStore.
 */
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AuthUser } from '@/types/auth.api'; //  Import đúng type

export function useAuth() {
  // Select specific parts of the state or actions needed
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  //  Sửa: setAuthData -> setAuth (theo authStore.ts)
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth); //  Sửa tên

  const logout = () => {
    clearAuth();
  };

  const updateUser = useAuthStore((state) => state.updateUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const [isLoggingOut] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Helper check role
  const isAdmin = user?.role === 'ADMIN'; //  Sửa thành chữ hoa
  const isTeacher = user?.role === 'TEACHER'; //  Sửa thành chữ hoa
  const isPendingTeacher = user?.teacherProfile?.status === 'PENDING';

  // Simplified login action
  const signin = (token: string, userData: AuthUser) => {
    setAuth(userData, token); //  Dùng setAuth thay vì setAuthData
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
    isLoading,
    login: signin,
    logout,
    setUser: updateUser, //  Dùng updateUser thay vì setUser
    setAccessToken,
    isAdmin,
    isTeacher,
    isPendingTeacher,
    isLoggingOut,
  };
}
