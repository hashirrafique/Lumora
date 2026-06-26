'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getSocket } from '@/lib/socket'

interface OrderStatusPayload {
  orderNumber: string
  status: string
  at: string
}

export function useOrderSocket(orderNumber: string): void {
  const qc = useQueryClient()

  useEffect(() => {
    if (!orderNumber) return
    const socket = getSocket()

    const handler = (payload: OrderStatusPayload) => {
      if (payload.orderNumber === orderNumber) {
        void qc.invalidateQueries({ queryKey: ['order', orderNumber] })
      }
    }
    socket.on('order:status', handler)

    return () => {
      socket.off('order:status', handler)
    }
  }, [orderNumber, qc])
}
