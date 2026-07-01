'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, type CouponDTO } from '@/lib/api'

export const adminKeys = {
  overview: (days: number) => ['admin', 'overview', days] as const,
  sales: (days: number) => ['admin', 'sales', days] as const,
  top: () => ['admin', 'top'] as const,
  orders: (status?: string, page?: number) => ['admin', 'orders', status, page] as const,
  users: (q?: string, role?: string, page?: number) => ['admin', 'users', q, role, page] as const,
  reviews: (filter?: string, page?: number) => ['admin', 'reviews', filter, page] as const,
}

export function useAdminOverview(days = 30) {
  return useQuery({
    queryKey: adminKeys.overview(days),
    queryFn: () => adminApi.overview(days),
    staleTime: 60_000,
  })
}

export function useAdminSales(days = 30) {
  return useQuery({
    queryKey: adminKeys.sales(days),
    queryFn: () => adminApi.sales(days),
    staleTime: 60_000,
  })
}

export function useAdminTop() {
  return useQuery({
    queryKey: adminKeys.top(),
    queryFn: adminApi.top,
    staleTime: 60_000,
  })
}

export function useAdminOrders(status?: string, page = 1) {
  return useQuery({
    queryKey: adminKeys.orders(status, page),
    queryFn: () => adminApi.listOrders(status, page),
    staleTime: 30_000,
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })
}

export function useAdminUsers(q?: string, role?: string, page = 1) {
  return useQuery({
    queryKey: adminKeys.users(q, role, page),
    queryFn: () => adminApi.listUsers(q, role, page),
    staleTime: 30_000,
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: { role?: 'customer' | 'admin'; isBanned?: boolean }
    }) => adminApi.updateUser(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useAdminReviews(filter: 'true' | 'false' | 'all' = 'all', page = 1) {
  return useQuery({
    queryKey: adminKeys.reviews(filter, page),
    queryFn: () => adminApi.listReviews(filter, page),
    staleTime: 30_000,
  })
}

export function useApproveReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      adminApi.approveReview(id, isApproved),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'reviews'] })
    },
  })
}

export function useDeleteAdminReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteReview(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'reviews'] })
    },
  })
}

export function useAdminCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => adminApi.createProduct(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useAdminUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      adminApi.updateProduct(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useAdminDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useAdminCoupons() {
  return useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: adminApi.listCoupons,
    staleTime: 30_000,
  })
}

export function useCreateCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<CouponDTO, '_id' | 'usedCount' | 'createdAt'>) =>
      adminApi.createCoupon(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  })
}

export function useUpdateCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<Omit<CouponDTO, '_id' | 'usedCount' | 'createdAt'>>
    }) => adminApi.updateCoupon(id, data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  })
}

export function useDeleteCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteCoupon(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  })
}
