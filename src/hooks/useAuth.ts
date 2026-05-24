/**
 * @file Custom hook to conveniently access the authentication state and actions
 * from the useAuthStore.
 */
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Provides access to the authentication state (isAuthenticated, user, accessToken)
 * and actions (setAuthData, clearAuthData, setUser, setAccessToken).
 *
 * @returns An object containing the authentication state and actions.
 * Example usage in a component:
 * ```jsx
 * const { isAuthenticated, user, login, logout } = useAuth();
 * if (isLoading) return <Spinner />; // isLoading might come from another hook like useSWR
 * if (!isAuthenticated) return <LoginComponent />;
 * return <div>Welcome {user?.fullName}! <button onClick={logout}>Logout</button></div>;
 * ```
 */
export function useAuth() {
  // Select specific parts of the state or actions needed
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const clearAuthData = useAuthStore((state) => state.clearAuthData);
  const logout = () => {
    clearAuthData();
  };
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 2. [QUAN TRỌNG FIX LỖI] State kiểm tra xem Zustand đã đọc xong localStorage chưa
  const [isHydrated, setIsHydrated] = useState(false);

  // ... [Logic fetch user hiện tại từ API /api/users/me] ...

  // =========================================================================
  // [Task: S3-FE-03] BỔ SUNG HELPER ĐỂ CHECK ROLE
  // =========================================================================
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';

  // Tùy chọn: Thêm cờ để biết user này có đang chờ duyệt profile không (dựa vào data profile kèm theo)
  const isPendingTeacher = user?.teacherProfile?.status === 'PENDING';
  // =========================================================================

  // Optional: Create simplified aliases for common actions
  const signin = (token: string, userData: import('@/types').AuthUser) => {
    useAuthStore.getState().setAuthData(token, userData);
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signup = () => {
    useAuthStore.getState().clearAuthData();
    // Optional: Add redirect logic or API call here if needed globally on logout
    // authApi.logout().finally(() => { // Call logout API
    //    clearAuthData();
    //    // router.push('/sign-in'); // Redirect
    // });
  };
  useEffect(() => {
    // Sử dụng setTimeout hoặc requestAnimationFrame
    const timer = setTimeout(() => setIsHydrated(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // 3. Trạng thái isLoading: Bằng TRUE nếu hệ thống chưa Hydrate xong
  const isLoading = !isHydrated;

  return {
    isAuthenticated,
    user,
    accessToken,
    isLoading, // không phá cấu trúc
    login: signin, // Simplified login action
    logout, // Simplified logout action
    setUser, // Expose direct setUser action
    setAccessToken, // Expose direct setAccessToken action
    // setAuthData, // Expose original actions if needed
    // clearAuthData,
    isAdmin,
    // [Task: S3-FE-03] Export cờ isTeacher để các component khác sử dụng
    isTeacher,
    isPendingTeacher,
    isLoggingOut,
  };
}
