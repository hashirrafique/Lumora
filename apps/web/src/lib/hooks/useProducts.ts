'use client'

import { useQuery } from '@tanstack/react-query'
import { productsApi, categoriesApi, type ProductFilters } from '../api'

export const productKeys = {
  all: ['products'] as const,
  list: (filters: ProductFilters) => [...productKeys.all, 'list', filters] as const,
  detail: (slug: string) => [...productKeys.all, 'detail', slug] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  bestsellers: () => [...productKeys.all, 'bestsellers'] as const,
  reviews: (productId: string, page: number) => [...productKeys.all, 'reviews', productId, page] as const,
}

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsApi.list(filters),
    staleTime: 30_000,
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => productsApi.get(slug),
    staleTime: 60_000,
    enabled: !!slug,
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: productsApi.featured,
    staleTime: 5 * 60_000,
  })
}

export function useBestsellers() {
  return useQuery({
    queryKey: productKeys.bestsellers(),
    queryFn: productsApi.bestsellers,
    staleTime: 5 * 60_000,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: categoriesApi.list,
    staleTime: 10 * 60_000,
  })
}

export function useProductReviews(productId: string, page = 1) {
  return useQuery({
    queryKey: productKeys.reviews(productId, page),
    queryFn: () => productsApi.reviews(productId, page),
    enabled: !!productId,
    staleTime: 60_000,
  })
}
