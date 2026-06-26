'use client'

import { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'

interface StockUpdatePayload {
  productId: string
  stock: number
}

export function useStockSocket(productId: string, initialStock: number): number {
  const [stock, setStock] = useState(initialStock)

  useEffect(() => {
    setStock(initialStock)
  }, [initialStock])

  useEffect(() => {
    if (!productId) return
    const socket = getSocket()

    socket.emit('subscribe:product', productId)

    const handler = (payload: StockUpdatePayload) => {
      if (payload.productId === productId) {
        setStock(payload.stock)
      }
    }
    socket.on('stock:update', handler)

    return () => {
      socket.off('stock:update', handler)
      socket.emit('unsubscribe:product', productId)
    }
  }, [productId])

  return stock
}
