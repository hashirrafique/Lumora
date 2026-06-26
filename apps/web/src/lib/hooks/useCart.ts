'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '../api'

export const cartKeys = {
  all: ['cart'] as const,
  cart: () => [...cartKeys.all, 'data'] as const,
}

export function useCart() {
  return useQuery({
    queryKey: cartKeys.cart(),
    queryFn: cartApi.get,
    staleTime: 0,
    retry: 1,
  })
}

export function useAddToCart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      qty,
      variant,
    }: {
      productId: string
      qty: number
      variant?: { name: string; value: string }
    }) => cartApi.addItem(productId, qty, variant),
    onSuccess: (data) => {
      qc.setQueryData(cartKeys.cart(), data)
    },
  })
}

export function useUpdateCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      qty,
      variantName,
      variantValue,
    }: {
      productId: string
      qty: number
      variantName?: string
      variantValue?: string
    }) => cartApi.updateItem(productId, qty, variantName, variantValue),
    onSuccess: (data) => {
      qc.setQueryData(cartKeys.cart(), data)
    },
  })
}

export function useRemoveCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      variantName,
      variantValue,
    }: {
      productId: string
      variantName?: string
      variantValue?: string
    }) => cartApi.removeItem(productId, variantName, variantValue),
    onSuccess: (data) => {
      qc.setQueryData(cartKeys.cart(), data)
    },
  })
}

export function useApplyCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => cartApi.applyCoupon(code),
    onSuccess: (data) => {
      qc.setQueryData(cartKeys.cart(), data)
    },
  })
}

export function useRemoveCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cartApi.removeCoupon,
    onSuccess: (data) => {
      qc.setQueryData(cartKeys.cart(), data)
    },
  })
}
