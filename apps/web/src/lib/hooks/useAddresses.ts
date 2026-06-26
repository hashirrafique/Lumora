'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, type AddressDTO } from '../api'

const KEYS = {
  all: ['addresses'] as const,
}

export function useAddresses() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => authApi.listAddresses(),
    staleTime: 60_000,
  })
}

export function useAddAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (addr: Omit<AddressDTO, '_id'>) => authApi.addAddress(addr),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useUpdateAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, addr }: { id: string; addr: Partial<AddressDTO> }) =>
      authApi.updateAddress(id, addr),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useDeleteAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => authApi.deleteAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}
