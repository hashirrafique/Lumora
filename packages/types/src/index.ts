// ─────────────────────────────────────────────────────────────────────────────
// Shared DTOs and enums for LUMORA — imported by both apps/api and apps/web
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'admin'

export type OrderStatus = 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled'

export type CouponType = 'percent' | 'fixed'

export type PaymentStatus = 'paid' | 'failed' | 'refunded'

export type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular'

// ── API envelope ─────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
  meta?: PaginationMeta
}

export interface ApiFailure {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: unknown[]
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ── Address ──────────────────────────────────────────────────────────────────

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

// ── User ─────────────────────────────────────────────────────────────────────

export interface UserDTO {
  _id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  addresses: AddressDTO[]
  isBanned: boolean
  createdAt: string
  updatedAt: string
}

// ── Category ─────────────────────────────────────────────────────────────────

export interface CategoryDTO {
  _id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  order: number
}

// ── Product ──────────────────────────────────────────────────────────────────

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
  updatedAt: string
}

export interface ProductListDTO {
  products: ProductDTO[]
  meta: PaginationMeta
}

// ── Cart ─────────────────────────────────────────────────────────────────────

export interface CartVariant {
  name: string
  value: string
}

export interface CartItemDTO {
  product: ProductDTO
  qty: number
  variant?: CartVariant
}

export interface CartTotals {
  subtotal: number
  discount: number
  shipping: number
  total: number
}

export interface CartDTO {
  _id: string
  user: string
  items: CartItemDTO[]
  coupon?: CouponDTO
  totals: CartTotals
}

// ── Coupon ───────────────────────────────────────────────────────────────────

export interface CouponDTO {
  _id: string
  code: string
  type: CouponType
  value: number
  minSubtotal: number
  maxUses?: number
  usedCount: number
  expiresAt?: string
  isActive: boolean
}

// ── Order ────────────────────────────────────────────────────────────────────

export interface OrderItemDTO {
  product: string
  title: string
  image: string
  price: number
  qty: number
  variant?: CartVariant
}

export interface OrderStatusHistoryDTO {
  status: OrderStatus
  at: string
}

export interface ShippingMethodDTO {
  name: string
  price: number
  etaDays: number
}

export interface OrderPaymentDTO {
  method: 'simulated'
  brandGuess?: string
  last4?: string
  status: PaymentStatus
}

export interface OrderDTO {
  _id: string
  orderNumber: string
  user: string | UserDTO
  items: OrderItemDTO[]
  shippingAddress: AddressDTO
  subtotal: number
  discount: number
  shipping: number
  total: number
  couponCode?: string
  payment: OrderPaymentDTO
  status: OrderStatus
  statusHistory: OrderStatusHistoryDTO[]
  shippingMethod: ShippingMethodDTO
  createdAt: string
  updatedAt: string
}

// ── Review ───────────────────────────────────────────────────────────────────

export interface ReviewDTO {
  _id: string
  product: string
  user: UserDTO | string
  rating: number
  title?: string
  body: string
  isVerifiedPurchase: boolean
  isApproved: boolean
  createdAt: string
  updatedAt: string
}

// ── Wishlist ─────────────────────────────────────────────────────────────────

export interface WishlistDTO {
  _id: string
  user: string
  products: ProductDTO[]
}

// ── Socket events ────────────────────────────────────────────────────────────

export interface StockUpdatePayload {
  productId: string
  stock: number
}

export interface OrderStatusPayload {
  orderNumber: string
  status: OrderStatus
  at: string
}

// ── Admin analytics ──────────────────────────────────────────────────────────

export interface OverviewStatsDTO {
  revenue: number
  orders: number
  aov: number
  newUsers: number
  deltas: {
    revenue: number
    orders: number
    aov: number
    newUsers: number
  }
}

export interface SalesDataPointDTO {
  date: string
  revenue: number
  orders: number
}

export interface TopProductDTO {
  _id: string
  title: string
  image: string
  soldCount: number
  revenue: number
}

export interface TopCategoryDTO {
  _id: string
  name: string
  orders: number
  revenue: number
}

export interface TopStatsDTO {
  topProducts: TopProductDTO[]
  topCategories: TopCategoryDTO[]
}

// ── AI chat ──────────────────────────────────────────────────────────────────

export interface ChatMessageDTO {
  role: 'user' | 'assistant' | 'tool'
  content: string
}

export interface ToolActionDTO {
  type: 'add_to_cart'
  productId: string
  qty: number
  variant?: CartVariant
}
