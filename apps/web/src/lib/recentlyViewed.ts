import type { ProductDTO } from '@/lib/api'

const KEY = 'lumora-recently-viewed'
const MAX = 8

export function addRecentlyViewed(product: ProductDTO): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getRecentlyViewed()
    const filtered = existing.filter((p) => p._id !== product._id)
    const updated = [product, ...filtered].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(updated))
  } catch {
    // ignore quota errors
  }
}

export function getRecentlyViewed(): ProductDTO[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as ProductDTO[]
  } catch {
    return []
  }
}

export function removeRecentlyViewed(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getRecentlyViewed()
    localStorage.setItem(KEY, JSON.stringify(existing.filter((p) => p._id !== id)))
  } catch {
    // ignore
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
