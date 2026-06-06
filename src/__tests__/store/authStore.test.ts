import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/authStore';
import type { AuthUser } from '@/types/auth.api';

const mockUser: AuthUser = {
  id: 'user-1',
  fullName: 'Test User',
  email: 'test@example.com',
  role: 'STUDENT',
  avatarUrl: null,
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    localStorage.clear();
  });

  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  describe('setAuth', () => {
    it('sets user, token, and isAuthenticated', () => {
      useAuthStore.getState().setAuth(mockUser, 'tok-123');
      const state = useAuthStore.getState();
      expect(state.user).toEqual({ ...mockUser, role: 'STUDENT' });
      expect(state.accessToken).toBe('tok-123');
      expect(state.isAuthenticated).toBe(true);
    });

    it('persists token to localStorage', () => {
      useAuthStore.getState().setAuth(mockUser, 'tok-abc');
      expect(localStorage.getItem('accessToken')).toBe('tok-abc');
    });

    it('normalizes role to uppercase', () => {
      const lowercaseRoleUser = { ...mockUser, role: 'student' as AuthUser['role'] };
      useAuthStore.getState().setAuth(lowercaseRoleUser, 'tok-123');
      expect(useAuthStore.getState().user?.role).toBe('STUDENT');
    });
  });

  describe('clearAuth', () => {
    it('resets state to initial values', () => {
      useAuthStore.getState().setAuth(mockUser, 'tok-123');
      useAuthStore.getState().clearAuth();
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('removes token from localStorage', () => {
      useAuthStore.getState().setAuth(mockUser, 'tok-123');
      useAuthStore.getState().clearAuth();
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('partially updates user data', () => {
      useAuthStore.getState().setAuth(mockUser, 'tok-123');
      useAuthStore.getState().updateUser({ fullName: 'Updated Name' });
      expect(useAuthStore.getState().user?.fullName).toBe('Updated Name');
      expect(useAuthStore.getState().user?.email).toBe('test@example.com');
    });

    it('does nothing when user is null', () => {
      useAuthStore.getState().updateUser({ fullName: 'Updated Name' });
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('setAccessToken', () => {
    it('sets token and persists to localStorage', () => {
      useAuthStore.getState().setAccessToken('new-token');
      expect(useAuthStore.getState().accessToken).toBe('new-token');
      expect(localStorage.getItem('accessToken')).toBe('new-token');
    });

    it('clears token from localStorage when set to null', () => {
      useAuthStore.getState().setAccessToken('tok');
      useAuthStore.getState().setAccessToken(null);
      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });
});
