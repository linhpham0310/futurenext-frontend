// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser } from '@/types/auth.api';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  // Actions

  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  updateUser: (userData: Partial<AuthUser>) => void;
  setAccessToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('accessToken', token);

        set({ user, accessToken: token, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      updateUser: (updatedData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedData } : null,
        })),

      setAccessToken: (token) => {
        if (token) {
          localStorage.setItem('accessToken', token);
        } else {
          localStorage.removeItem('accessToken');
        }
        set({ accessToken: token });
      },
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, setAuth, clearAuth, updateUser, setAccessToken } =
    useAuthStore();

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const isPendingTeacher = user?.teacherProfile?.status === 'pending_review';

  return {
    user,
    accessToken,
    isAuthenticated,
    isAdmin,
    isTeacher,
    isStudent,
    isPendingTeacher,
    setAuth,
    clearAuth,
    updateUser,
    setAccessToken,
    setUser: (userData: AuthUser | null) => updateUser(userData || {}),
  };
};
