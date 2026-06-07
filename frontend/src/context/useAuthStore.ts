import { create } from 'zustand';
import type { AuthState, User } from '../types/user';

export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Initially null
  token: null,
  isAuthenticated: false,
  login: (user: User, token: string) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));