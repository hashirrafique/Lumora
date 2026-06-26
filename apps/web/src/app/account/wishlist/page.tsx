'use client'

import { Heart } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { useWishlist } from '@/lib/hooks/useWishlist'
import Link from 'next/link'

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist()

  return (
    <div className="space-y-4">
      <h1 className="font-display font-semibold text-xl">Wishlist</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] skeleton rounded-3xl" />
          ))}
        </div>
      ) : !wishlist?.products.length ? (
        <EmptyState
          icon={<Heart size={24} />}
          title="Your wishlist is empty"
          description="Save products you love and come back to them anytime."
          action={<Link href="/shop" className="btn-primary">Browse shop</Link>}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {wishlist.products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
