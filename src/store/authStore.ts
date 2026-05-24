/**
 * @file Zustand store for managing authentication state globally.
 * Includes persistence to localStorage.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware'; // Import persist middleware
import { AuthUser } from '@/types'; // Import user type

/**
 * Interface defining the structure of the authentication state.
 */
interface AuthState {
  isAuthenticated: boolean; // Flag indicating if user is logged in
  user: AuthUser | null; // Logged-in user information (null if not logged in)
  accessToken: string | null; // JWT Access Token (null if not logged in)
  // Actions to update the state

  /** ✅ NEW */
  hasHydrated: boolean;
  setHasHydrated: () => void;

  setAuthData: (token: string, userData: AuthUser) => void; // Action on successful login/refresh
  clearAuthData: () => void; // Action on logout or session expiry
  setUser: (userData: AuthUser | null) => void; // Action to update user info (e.g., after profile update)
  setAccessToken: (token: string | null) => void; // Action to update token (e.g., after refresh)
}

/**
 * Creates the Zustand store for authentication state.
 * Uses the `persist` middleware to save state to localStorage.
 */
export const useAuthStore = create<AuthState>()(
  // 1. Persist Middleware Configuration
  persist(
    // 2. Store Definition Function (receives `set` function)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (set, get) => ({
      // --- Initial State ---
      isAuthenticated: false,
      user: null,
      accessToken: null,

      hasHydrated: false,
      setHasHydrated: () => {
        set({ hasHydrated: true });
      },

      // --- Actions ---

      /**
       * Updates the store upon successful login or token refresh.
       * Sets isAuthenticated to true, stores user data and access token.
       */
      setAuthData: (token: string, userData: AuthUser) => {
        console.log('AuthStore: Setting auth data', { token: '***', userData }); // Log for debugging
        set({
          isAuthenticated: true,
          user: userData,
          accessToken: token,
        });
      },

      /**
       * Clears all authentication data from the store (logout or session expiry).
       * Sets isAuthenticated to false and nullifies user/token.
       */
      clearAuthData: () => {
        console.log('AuthStore: Clearing auth data');
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
        });
        // Optional: Clear other related storage if needed
        // localStorage.removeItem('some-other-key');
      },

      /**
       * Updates only the user information in the store.
       * Useful after updating the user profile.
       */
      setUser: (userData: AuthUser | null) => {
        console.log('AuthStore: Updating user data', userData);
        // Ensure isAuthenticated remains true if user data is updated while logged in
        set((state) => ({
          user: userData,
          isAuthenticated: userData ? state.isAuthenticated : false, // Logout if user becomes null
        }));
      },

      /**
       * Updates only the access token.
       * Useful after token refresh via interceptor.
       */
      setAccessToken: (token: string | null) => {
        console.log('AuthStore: Updating access token');
        set({ accessToken: token });
      },
    }),
    // 3. Persist Options
    {
      name: 'auth-storage', // Key used in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage (can switch to sessionStorage if needed)
      // Optional: Choose which parts of the state to persist
      // partialize: (state) => ({
      //   isAuthenticated: state.isAuthenticated,
      //   user: state.user,
      //   accessToken: state.accessToken, // Persist token for session continuity
      // }),
      // Optional: Handle migration if state structure changes
      // version: 1,
      // migrate: (persistedState, version) => { ... }
      // Optional: Called after rehydration is complete
      // onRehydrateStorage: (state) => {
      //   console.log("AuthStore: Hydration finished");
      //   return (state, error) => {
      //     if (error) {
      //       console.error("AuthStore: An error happened during hydration", error);
      //       // Optionally clear storage on error
      //       // useAuthStore.persist.clearStorage();
      //     } else {
      //       console.log("AuthStore: Rehydration successful");
      //     }
      //   }
      // }
    }
  )
);

// Optional: Export helper function to get state outside React components (use carefully)
// export const getAuthState = () => useAuthStore.getState();
