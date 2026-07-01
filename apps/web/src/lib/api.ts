'use client'

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown[]
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  csrfToken?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }

  // Abort after 15 s so requests never hang on a cold/unreachable API
  const controller = new AbortController()
  const timerId = setTimeout(() => controller.abort(), 15_000)

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers,
    signal: options.signal ?? controller.signal,
  })
  clearTimeout(timerId)

  const json = (await res.json()) as {
    success: boolean
    data?: T
    error?: { code: string; message: string; details?: unknown[] }
  }

  if (!json.success || !res.ok) {
    throw new ApiError(
      res.status,
      json.error?.code ?? 'SERVER_ERROR',
      json.error?.message ?? 'An unexpected error occurred',
      json.error?.details
    )
  }

  return json.data as T
}

export function getCsrfToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)csrf=([^;]+)/)
  return match ? decodeURIComponent(match[1]!) : ''
}

// ── Products ──────────────────────────────────────────────────────────────────
export interface ProductFilters {
  q?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  inStock?: boolean
  tags?: string
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular'
  page?: number
  limit?: number
  featured?: boolean
}

export function buildProductQueryString(filters: ProductFilters): string {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.category) params.set('category', filters.category)
  if (filters.brand) params.set('brand', filters.brand)
  if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice))
  if (filters.minRating != null) params.set('minRating', String(filters.minRating))
  if (filters.inStock) params.set('inStock', 'true')
  if (filters.featured) params.set('featured', 'true')
  if (filters.tags) params.set('tags', filters.tags)
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  return params.toString()
}

export const productsApi = {
  list: (filters: ProductFilters = {}) => {
    const qs = buildProductQueryString(filters)
    return apiFetch<{
      products: ProductDTO[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }>(`/products?${qs}`)
  },
  get: (slug: string) => apiFetch<ProductDTO>(`/products/${slug}`),
  featured: () => apiFetch<ProductDTO[]>('/products/featured'),
  bestsellers: () => apiFetch<ProductDTO[]>('/products/bestsellers'),
  reviews: (productId: string, page = 1) =>
    apiFetch<{
      reviews: ReviewDTO[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }>(`/products/${productId}/reviews?page=${page}`),
}

export const categoriesApi = {
  list: () => apiFetch<CategoryDTO[]>('/categories'),
}

export const cartApi = {
  get: () => apiFetch<CartResponse>('/cart'),
  addItem: (productId: string, qty: number, variant?: { name: string; value: string }) =>
    apiFetch<CartResponse>(
      '/cart/items',
      {
        method: 'POST',
        body: JSON.stringify({ productId, qty, variant }),
      },
      getCsrfToken()
    ),
  updateItem: (productId: string, qty: number, variantName?: string, variantValue?: string) => {
    const qs = variantName ? `?variantName=${variantName}&variantValue=${variantValue}` : ''
    return apiFetch<CartResponse>(
      `/cart/items/${productId}${qs}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ qty }),
      },
      getCsrfToken()
    )
  },
  removeItem: (productId: string, variantName?: string, variantValue?: string) => {
    const qs = variantName ? `?variantName=${variantName}&variantValue=${variantValue}` : ''
    return apiFetch<CartResponse>(
      `/cart/items/${productId}${qs}`,
      { method: 'DELETE' },
      getCsrfToken()
    )
  },
  clear: () => apiFetch<CartResponse>('/cart', { method: 'DELETE' }, getCsrfToken()),
  applyCoupon: (code: string) =>
    apiFetch<CartResponse>(
      '/cart/coupon',
      {
        method: 'POST',
        body: JSON.stringify({ code }),
      },
      getCsrfToken()
    ),
  removeCoupon: () => apiFetch<CartResponse>('/cart/coupon', { method: 'DELETE' }, getCsrfToken()),
  merge: (
    items: Array<{ productId: string; qty: number; variant?: { name: string; value: string } }>
  ) =>
    apiFetch<CartResponse>(
      '/cart/merge',
      {
        method: 'POST',
        body: JSON.stringify({ items }),
      },
      getCsrfToken()
    ),
}

export const wishlistApi = {
  get: () => apiFetch<WishlistResponse>('/wishlist'),
  toggle: (productId: string) =>
    apiFetch<{ added: boolean }>(
      '/wishlist/toggle',
      {
        method: 'POST',
        body: JSON.stringify({ productId }),
      },
      getCsrfToken()
    ),
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface UserDTO {
  _id: string
  name: string
  email: string
  role: 'customer' | 'admin'
  avatarUrl?: string
  isBanned: boolean
}

export interface AddressDTO {
  _id?: string
  label?: string
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  isDefault: boolean
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    apiFetch<UserDTO>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      },
      getCsrfToken()
    ),
  login: (email: string, password: string) =>
    apiFetch<UserDTO>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      getCsrfToken()
    ),
  logout: () =>
    apiFetch<{ loggedOut: boolean }>('/auth/logout', { method: 'POST' }, getCsrfToken()),
  me: () => apiFetch<UserDTO>('/auth/me'),
  forgotPassword: (email: string) =>
    apiFetch<{ sent: boolean }>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
      getCsrfToken()
    ),
  resetPassword: (token: string, password: string) =>
    apiFetch<{ reset: boolean }>(
      '/auth/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      },
      getCsrfToken()
    ),
  listAddresses: () => apiFetch<AddressDTO[]>('/auth/me/addresses'),
  addAddress: (addr: Omit<AddressDTO, '_id'>) =>
    apiFetch<AddressDTO>(
      '/auth/me/addresses',
      {
        method: 'POST',
        body: JSON.stringify(addr),
      },
      getCsrfToken()
    ),
  updateAddress: (id: string, addr: Partial<AddressDTO>) =>
    apiFetch<AddressDTO>(
      `/auth/me/addresses/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(addr),
      },
      getCsrfToken()
    ),
  deleteAddress: (id: string) =>
    apiFetch<{ deleted: boolean }>(
      `/auth/me/addresses/${id}`,
      {
        method: 'DELETE',
      },
      getCsrfToken()
    ),
}

// ── Orders ─────────────────────────────────────────────────────────────────────
export interface OrderItemDTO {
  product: ProductDTO | string
  title: string
  image: string
  price: number
  qty: number
  variant?: { name: string; value: string }
}

export interface OrderStatusHistoryDTO {
  status: string
  at: string
}

export interface OrderDTO {
  _id: string
  orderNumber: string
  user: string
  items: OrderItemDTO[]
  shippingAddress: AddressDTO
  subtotal: number
  discount: number
  shipping: number
  total: number
  couponCode?: string
  payment: {
    method: 'simulated'
    brandGuess?: string
    last4?: string
    status: 'paid' | 'failed' | 'refunded'
  }
  status: 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
  statusHistory: OrderStatusHistoryDTO[]
  shippingMethod: { name: string; price: number; etaDays: number }
  createdAt: string
  updatedAt: string
}

export interface CheckoutInput {
  shippingAddress: AddressDTO
  shippingMethod: { name: string; price: number; etaDays: number }
  payment: { number: string; exp: string; cvc: string; name: string }
}

export const ordersApi = {
  create: (input: CheckoutInput, idempotencyKey?: string) =>
    apiFetch<OrderDTO>(
      '/orders',
      {
        method: 'POST',
        body: JSON.stringify(input),
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
      },
      getCsrfToken()
    ),
  list: (page = 1, limit = 10) => apiFetch<OrderDTO[]>(`/orders?page=${page}&limit=${limit}`),
  get: (orderNumber: string) => apiFetch<OrderDTO>(`/orders/${orderNumber}`),
}

// ── Shared DTOs (lightweight frontend versions) ────────────────────────────────
export interface ProductImageDTO {
  url: string
  alt: string
}

export interface ProductVariantOptionDTO {
  label: string
  value: string
  hex?: string
  stockDelta?: number
}

export interface ProductVariantDTO {
  name: string
  options: ProductVariantOptionDTO[]
}

export interface ProductSpecDTO {
  key: string
  value: string
}

export interface CategoryDTO {
  _id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  order: number
}

export interface ProductDTO {
  _id: string
  title: string
  slug: string
  description: string
  brand: string
  category: CategoryDTO | string
  price: number
  compareAtPrice?: number
  currency: string
  images: ProductImageDTO[]
  variants: ProductVariantDTO[]
  specs: ProductSpecDTO[]
  tags: string[]
  stock: number
  ratingAvg: number
  ratingCount: number
  soldCount: number
  isFeatured: boolean
  isBestseller: boolean
  isActive: boolean
  createdAt: string
}

export interface ReviewDTO {
  _id: string
  user: { name: string; avatarUrl?: string }
  rating: number
  title?: string
  body: string
  isVerifiedPurchase: boolean
  createdAt: string
}

export interface CartItemDTO {
  product: ProductDTO
  qty: number
  variant?: { name: string; value: string }
}

export interface CartResponse {
  _id?: string
  items: CartItemDTO[]
  coupon?: unknown
  subtotal: number
  discount: number
  shipping: number
  total: number
  couponCode?: string
}

export interface WishlistResponse {
  products: ProductDTO[]
  count: number
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface CouponDTO {
  _id: string
  code: string
  type: 'percent' | 'fixed'
  value: number
  minSubtotal: number
  maxUses?: number
  usedCount: number
  expiresAt?: string
  isActive: boolean
  createdAt: string
}

export interface AdminOverviewDTO {
  revenue: number
  orders: number
  aov: number
  newUsers: number
  deltas: {
    revenue: number | null
    orders: number | null
    aov: number | null
    newUsers: number | null
  }
}

export interface SalesDataPoint {
  date: string
  revenue: number
  orders: number
}

export interface TopProductDTO {
  _id: string
  title: string
  slug: string
  price: number
  soldCount: number
  images: ProductImageDTO[]
}

export interface TopCategoryDTO {
  _id: string
  name: string
  slug: string
  productCount: number
  totalSold: number
}

export interface AdminUserDTO {
  _id: string
  name: string
  email: string
  role: 'customer' | 'admin'
  avatarUrl?: string
  isBanned: boolean
  createdAt: string
}

export interface AdminReviewDTO {
  _id: string
  user: { _id: string; name: string; avatarUrl?: string }
  product: { _id: string; title: string; slug: string }
  rating: number
  title?: string
  body: string
  isApproved: boolean
  isVerifiedPurchase: boolean
  createdAt: string
}

export interface PaginatedMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export const adminApi = {
  // Analytics
  overview: (days = 30) => apiFetch<AdminOverviewDTO>(`/admin/stats/overview?days=${days}`),
  sales: (days = 30) => apiFetch<SalesDataPoint[]>(`/admin/stats/sales?days=${days}`),
  top: () =>
    apiFetch<{ topProducts: TopProductDTO[]; topCategories: TopCategoryDTO[] }>('/admin/stats/top'),

  // Orders
  listOrders: (status?: string, page = 1, limit = 20) => {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status) qs.set('status', status)
    return apiFetch<{ data: OrderDTO[]; meta: PaginatedMeta }>(`/admin/orders?${qs}`)
  },
  updateOrderStatus: (id: string, status: string) =>
    apiFetch<OrderDTO>(
      `/admin/orders/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      getCsrfToken()
    ),

  // Users
  listUsers: (q?: string, role?: string, page = 1, limit = 20) => {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (q) qs.set('q', q)
    if (role) qs.set('role', role)
    return apiFetch<{ data: AdminUserDTO[]; meta: PaginatedMeta }>(`/admin/users?${qs}`)
  },
  updateUser: (id: string, payload: { role?: 'customer' | 'admin'; isBanned?: boolean }) =>
    apiFetch<AdminUserDTO>(
      `/admin/users/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      getCsrfToken()
    ),

  // Reviews
  listReviews: (isApproved: 'true' | 'false' | 'all' = 'all', page = 1, limit = 20) =>
    apiFetch<{ data: AdminReviewDTO[]; meta: PaginatedMeta }>(
      `/admin/reviews?isApproved=${isApproved}&page=${page}&limit=${limit}`
    ),
  approveReview: (id: string, isApproved: boolean) =>
    apiFetch<AdminReviewDTO>(
      `/admin/reviews/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ isApproved }),
      },
      getCsrfToken()
    ),
  deleteReview: (id: string) =>
    apiFetch<{ deleted: boolean }>(`/admin/reviews/${id}`, { method: 'DELETE' }, getCsrfToken()),

  // Products (admin mutations)
  createProduct: (data: Record<string, unknown>) =>
    apiFetch<ProductDTO>(
      '/products',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      getCsrfToken()
    ),
  updateProduct: (id: string, data: Record<string, unknown>) =>
    apiFetch<ProductDTO>(
      `/products/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      getCsrfToken()
    ),
  deleteProduct: (id: string) =>
    apiFetch<{ deleted: boolean }>(`/products/${id}`, { method: 'DELETE' }, getCsrfToken()),

  // Uploads
  signUpload: (folder?: string) =>
    apiFetch<{
      signature: string
      timestamp: number
      apiKey: string
      cloudName: string
      folder: string
    }>('/admin/uploads/sign', { method: 'POST', body: JSON.stringify({ folder }) }, getCsrfToken()),

  // Coupons
  listCoupons: () => apiFetch<CouponDTO[]>('/admin/coupons'),
  createCoupon: (data: Omit<CouponDTO, '_id' | 'usedCount' | 'createdAt'>) =>
    apiFetch<CouponDTO>(
      '/admin/coupons',
      { method: 'POST', body: JSON.stringify(data) },
      getCsrfToken()
    ),
  updateCoupon: (id: string, data: Partial<Omit<CouponDTO, '_id' | 'usedCount' | 'createdAt'>>) =>
    apiFetch<CouponDTO>(
      `/admin/coupons/${id}`,
      { method: 'PATCH', body: JSON.stringify(data) },
      getCsrfToken()
    ),
  deleteCoupon: (id: string) =>
    apiFetch<{ deleted: boolean }>(`/admin/coupons/${id}`, { method: 'DELETE' }, getCsrfToken()),
}
