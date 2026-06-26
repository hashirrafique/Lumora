'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, type CheckoutInput } from '../api'

export const orderKeys = {
  all: ['orders'] as const,
  list: (page: number) => [...orderKeys.all, 'list', page] as const,
  detail: (orderNumber: string) => [...orderKeys.all, 'detail', orderNumber] as const,
}

export function useOrders(page = 1) {
  return useQuery({
    queryKey: orderKeys.list(page),
    queryFn: () => ordersApi.list(page),
    staleTime: 30_000,
  })
}

export function useOrder(orderNumber: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderNumber),
    queryFn: () => ordersApi.get(orderNumber),
    enabled: !!orderNumber,
    staleTime: 30_000,
  })
}

export function usePlaceOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ input, idempotencyKey }: { input: CheckoutInput; idempotencyKey?: string }) =>
      ordersApi.create(input, idempotencyKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.all })
      qc.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
