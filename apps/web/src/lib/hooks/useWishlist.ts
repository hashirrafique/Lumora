'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistApi } from '../api'

export const wishlistKeys = {
  all: ['wishlist'] as const,
  wishlist: () => [...wishlistKeys.all, 'data'] as const,
}

export function useWishlist() {
  return useQuery({
    queryKey: wishlistKeys.wishlist(),
    queryFn: wishlistApi.get,
    staleTime: 60_000,
    retry: 1,
  })
}

export function useToggleWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) => wishlistApi.toggle(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wishlistKeys.wishlist() })
    },
  })
}
