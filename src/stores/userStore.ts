import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  fetchAllUsers: (token: string) => Promise<void>;
  updateUserRole: (userId: string, newRole: 'organizer' | 'attendee', token: string) => Promise<void>;
  setUsers: (users: User[]) => void;
  clearUsers: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      // State
      users: [],
      isLoading: false,
      error: null,

      fetchAllUsers: async (token: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/organizer/users`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch users:', response.status, errorText);
            set({ 
              error: `Failed to fetch users: ${response.status} ${response.statusText}`, 
              isLoading: false 
            });
            return;
          }

          const usersData = await response.json();
          const users = usersData.data.users;
          
          if (!Array.isArray(users)) {
            console.error('Users data is not an array:', users);
            set({ 
              error: 'Invalid users data format', 
              isLoading: false 
            });
            return;
          }

          set({ users, isLoading: false });
        } catch (error) {
          console.error('Network error fetching users:', error);
          set({ 
            error: `Network error: ${error instanceof Error ? error.message : 'Please check your connection and try again.'}`,
            isLoading: false 
          });
        }
      },

      updateUserRole: async (userId: string, newRole: 'organizer' | 'attendee', token: string) => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/organizer/users/role/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({ new_role: newRole }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to update user role:', response.status, errorText);
            set({ 
              error: `Failed to update user role: ${response.status} ${response.statusText}`
            });
            return;
          }

          const updatedUser = await response.json();
          
          // Update the user in the store
          set((state) => ({
            users: state.users.map((user) => 
              user.user_id === userId ? updatedUser : user
            )
          }));

          // Return the updated user for potential use in components
          return updatedUser;
        } catch (error) {
          console.error('Network error updating user role:', error);
          set({ 
            error: `Network error: ${error instanceof Error ? error.message : 'Please check your connection and try again.'}`
          });
        }
      },

      setUsers: (users: User[]) => {
        set({ users });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearUsers: () => {
        set({
          users: [],
          isLoading: false,
          error: null,
        });
        
        if (useUserStore.persist?.clearStorage) {
          useUserStore.persist.clearStorage();
        }
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        users: state.users,
      }),
      version: 1,
    }
  )
);

export const userStoreActions = {
  clearUsers: () => useUserStore.getState().clearUsers(),
  setError: (error: string | null) => useUserStore.getState().setError(error),
  fetchAllUsers: (token: string) => useUserStore.getState().fetchAllUsers(token),
  updateUserRole: (userId: string, newRole: 'organizer' | 'attendee', token: string) => 
    useUserStore.getState().updateUserRole(userId, newRole, token),
  setLoading: (loading: boolean) => useUserStore.getState().setLoading(loading),
};