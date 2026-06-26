'use client'

import { useEffect } from 'react'
import { connectSocket, disconnectSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/auth.store'

export function useSocket(): void {
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    connectSocket()

    return () => {
      disconnectSocket()
    }
  }, [user])
}
