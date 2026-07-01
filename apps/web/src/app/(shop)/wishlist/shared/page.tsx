'use client'

export const dynamic = 'force-dynamic'

import { useSearchParams } from 'next/navigation'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { ProductCard } from '@/components/product/ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { useProducts } from '@/lib/hooks/useProducts'

export default function SharedWishlistPage() {
  const params = useSearchParams()
  const ids = params.get('ids') ?? ''

  const idList = ids.split(',').filter(Boolean)

  const { data, isLoading } = useProducts({ limit: 50 })
  const allProducts = data?.products ?? []

  const products = allProducts.filter((p) => idList.includes(p._id))

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet/10 flex items-center justify-center">
          <Heart size={18} className="text-violet" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display font-semibold text-2xl">Shared wishlist</h1>
          <p className="text-sm text-[var(--muted)]">
            {idList.length} item{idList.length !== 1 ? 's' : ''} · Browse and add what you love
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: idList.length || 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] skeleton rounded-3xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Heart size={24} />}
          title="Nothing to show"
          description="This wishlist is empty or the products are no longer available."
          action={
            <Link href="/shop" className="btn-primary">
              Browse shop
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}

      <div className="pt-4 text-center">
        <Link href="/shop" className="text-sm text-violet hover:underline">
          Explore all products →
        </Link>
      </div>
    </div>
  )
}
