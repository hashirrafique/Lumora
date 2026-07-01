'use client'

export const dynamic = 'force-dynamic'

import { Heart, Share2 } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist()
  const toast = useToast()

  const handleShare = async () => {
    if (!wishlist?.products.length) return
    const ids = wishlist.products.map((p) => p._id).join(',')
    const url = `${window.location.origin}/wishlist/shared?ids=${ids}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Wishlist link copied!')
    } catch {
      toast.error('Could not copy link')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-semibold text-xl">Wishlist</h1>
        {!isLoading && (wishlist?.products.length ?? 0) > 0 && (
          <button
            type="button"
            onClick={() => void handleShare()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-[var(--border)] text-sm hover:border-violet/40 transition-colors"
          >
            <Share2 size={14} aria-hidden="true" />
            Share wishlist
          </button>
        )}
      </div>

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
          action={
            <Link href="/shop" className="btn-primary">
              Browse shop
            </Link>
          }
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
