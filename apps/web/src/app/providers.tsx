'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, type ReactNode } from 'react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { connectSocket, disconnectSocket } from '@/lib/socket'
import { useLenisInit } from '@/lib/hooks/useLenis'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'

function ApiWakeUp() {
  const [waking, setWaking] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const controller = new AbortController()

    timer = setTimeout(() => setWaking(true), 1500)

    fetch(`${API_BASE}/health`, { signal: controller.signal })
      .then(() => {
        clearTimeout(timer)
        setWaking(false)
      })
      .catch(() => {
        setWaking(false)
      })

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [])

  if (!waking) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998] glass rounded-full px-4 py-2 text-xs text-[var(--muted)] flex items-center gap-2 shadow-card"
    >
      <span className="w-2 h-2 rounded-full bg-violet animate-pulse" aria-hidden="true" />
      Waking up the server — first load may be slow…
    </div>
  )
}

function AuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser)
  useEffect(() => {
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

function SocketBootstrap() {
  const user = useAuthStore((s) => s.user)
  useEffect(() => {
    connectSocket()
    return () => {
      disconnectSocket()
    }
  }, [user])
  return null
}

function SwBootstrap() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* SW not critical */
      })
    }
  }, [])
  return null
}

function LenisBootstrap() {
  const reduced = useReducedMotion()
  useLenisInit(reduced)
  return null
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: 3,
            retryDelay: (n) => Math.min(1_000 * 2 ** n, 8_000),
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ApiWakeUp />
      <AuthBootstrap />
      <SocketBootstrap />
      <SwBootstrap />
      <LenisBootstrap />
      {children}
    </QueryClientProvider>
  )
}
