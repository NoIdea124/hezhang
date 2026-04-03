import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Space } from '@hezhang/shared';

interface AuthState {
  token: string | null;
  user: User | null;
  space: Space | null;
  setAuth: (token: string, user: User) => void;
  setSpace: (space: Space) => void;
  updateUser: (fields: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      space: null,
      setAuth: (token, user) => {
        localStorage.setItem('token', token);
        set({ token, user });
      },
      setSpace: (space) => set({ space }),
      updateUser: (fields) => set((state) => ({
        user: state.user ? { ...state.user, ...fields } : null,
      })),
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, space: null });
      },
    }),
    {
      name: 'hezhang-auth',
    }
  )
);
