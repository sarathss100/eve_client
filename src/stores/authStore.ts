import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types';
import { ticketStoreActions } from './ticketStore';
import { eventStoreActions } from './eventStore';
import { userStoreActions } from './userStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phoneNumber: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  initializeAuth: () => void;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      initializeAuth: () => {
        const state = get();
        if (state.token && state.user) {
          set({ isAuthenticated: true });
        }
      },

      login: async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "Cache-Control": "no-store",
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (response.ok) {
            set({
              user: data.data,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true };
          } else {
            set({ isLoading: false });
            return { success: false, error: data.message || 'Invalid credentials' };
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return { 
            success: false, 
            error: 'Network error. Please check your connection and try again.' 
          };
        }
      },


      register: async (name: string, email: string, phone_number: string, password: string): Promise<{ success: boolean; error?: string }> => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "Cache-Control": "no-store",
            },
            credentials: 'include',
            body: JSON.stringify({ name, email, phone_number, password }),
          });

          const data = await response.json();

          if (response.ok) {
            set({
              user: data.data,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true };
          } else {
            // Handle error response from backend
            set({ isLoading: false });
            return { 
              success: false, 
              error: data.message || 'Registration failed. Please try again.' 
            };
          }
        } catch (error) {
          console.error('Registration error:', error);
          set({ isLoading: false });
          return { 
            success: false, 
            error: 'Network error. Please check your connection and try again.' 
          };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/signout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "Cache-Control": "no-store",
            },
            credentials: 'include',
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });

          useAuthStore.persist.clearStorage();
          ticketStoreActions.clearTickets();
          eventStoreActions.clearEvents();
          userStoreActions.clearUsers();
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);