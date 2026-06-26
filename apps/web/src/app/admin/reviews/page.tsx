'use client'

import { useState } from 'react'
import { Trash2, Check, X } from 'lucide-react'
import { useAdminReviews, useApproveReview, useDeleteAdminReview } from '@/lib/hooks/useAdmin'
import { Badge } from '@/components/ui/Badge'
import { RatingStars } from '@/components/ui/RatingStars'
import { cn } from '@/lib/utils'
import type { AdminReviewDTO } from '@/lib/api'

export default function AdminReviewsPage() {
  const [filter, setFilter] = useState<'all' | 'true' | 'false'>('all')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminReviews(filter, page)
  const approve = useApproveReview()
  const deleteReview = useDeleteAdminReview()

  const reviews = (data?.data ?? []) as AdminReviewDTO[]
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Reviews</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Moderate customer reviews</p>
      </div>

      <div className="flex gap-2">
        {(['all', 'true', 'false'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => { setFilter(f); setPage(1) }}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
              filter === f
                ? 'bg-violet/15 border-violet text-violet'
                : 'border-[var(--border)] text-[var(--muted)] hover:border-violet/40'
            )}
          >
            {f === 'all' ? 'All' : f === 'true' ? 'Approved' : 'Pending'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 skeleton rounded-xl" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-[var(--muted)]">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review._id} className="glass rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm font-medium">{review.user.name}</p>
                    <RatingStars rating={review.rating} showCount={false} size={12} />
                    <Badge variant={review.isApproved ? 'success' : 'warning'}>
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                    {review.isVerifiedPurchase && <Badge variant="cyan">Verified</Badge>}
                  </div>
                  {typeof review.product === 'object' && review.product && (
                    <p className="text-xs text-[var(--muted)]">{review.product.title}</p>
                  )}
                  {review.title && <p className="text-sm font-medium mt-1">{review.title}</p>}
                  <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-3">{review.body}</p>
                  <time className="text-xs text-[var(--muted)]">
                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </time>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!review.isApproved && (
                    <button
                      type="button"
                      onClick={() => approve.mutate({ id: review._id, isApproved: true })}
                      disabled={approve.isPending}
                      className="p-2 rounded-xl bg-success/10 text-success hover:bg-success/20 transition-colors disabled:opacity-50"
                      aria-label="Approve review"
                    >
                      <Check size={15} aria-hidden="true" />
                    </button>
                  )}
                  {review.isApproved && (
                    <button
                      type="button"
                      onClick={() => approve.mutate({ id: review._id, isApproved: false })}
                      disabled={approve.isPending}
                      className="p-2 rounded-xl bg-warning/10 text-warning hover:bg-warning/20 transition-colors disabled:opacity-50"
                      aria-label="Unapprove review"
                    >
                      <X size={15} aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteReview.mutate(review._id)}
                    disabled={deleteReview.isPending}
                    className="p-2 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                    aria-label="Delete review"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-xl text-xs glass border border-[var(--border)] disabled:opacity-40">Prev</button>
          <span className="px-3 py-1.5 text-xs text-[var(--muted)]">{page} / {meta.totalPages}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="px-3 py-1.5 rounded-xl text-xs glass border border-[var(--border)] disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  )
}
