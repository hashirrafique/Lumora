'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { authApi } from '../api'
import { useAuthStore } from '@/store/auth.store'
import { cartApi } from '../api'

export const authKeys = {
  me: ['auth', 'me'] as const,
}

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser)

  const query = useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    if (query.data) setUser(query.data)
    else if (query.isError) setUser(null)
  }, [query.data, query.isError, setUser])

  return query
}

export function useLogin() {
  const qc = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: async (user) => {
      setUser(user)
      qc.setQueryData(authKeys.me, user)
      // Merge guest cart after login
      try {
        await cartApi.get()
        qc.invalidateQueries({ queryKey: ['cart'] })
      } catch {
        // best-effort
      }
    },
  })
}

export function useRegister() {
  const qc = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      authApi.register(name, email, password),
    onSuccess: (user) => {
      setUser(user)
      qc.setQueryData(authKeys.me, user)
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  const router = useRouter()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setUser(null)
      qc.clear()
      router.push('/')
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
  })
}
