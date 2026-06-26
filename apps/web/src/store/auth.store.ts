'use client'

import { create } from 'zustand'

export interface AuthUser {
  _id: string
  name: string
  email: string
  role: 'customer' | 'admin'
  avatarUrl?: string
  isBanned: boolean
}

interface AuthState {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAdmin: () => get().user?.role === 'admin',
}))
