'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Search, Upload, X } from 'lucide-react'
import { useProducts, useCategories } from '@/lib/hooks/useProducts'
import {
  useAdminCreateProduct,
  useAdminUpdateProduct,
  useAdminDeleteProduct,
} from '@/lib/hooks/useAdmin'
import { adminApi } from '@/lib/api'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import type { ProductDTO, CategoryDTO } from '@/lib/api'

interface ProductFormData {
  title: string
  description: string
  brand: string
  category: string
  price: string
  compareAtPrice: string
  stock: string
  isFeatured: boolean
  isBestseller: boolean
  tags: string
  imageUrl: string
  imageAlt: string
}

const EMPTY_FORM: ProductFormData = {
  title: '',
  description: '',
  brand: '',
  category: '',
  price: '',
  compareAtPrice: '',
  stock: '',
  isFeatured: false,
  isBestseller: false,
  tags: '',
  imageUrl: '',
  imageAlt: '',
}

function productToForm(p: ProductDTO): ProductFormData {
  return {
    title: p.title,
    description: p.description,
    brand: p.brand,
    category: typeof p.category === 'object' ? p.category._id : p.category,
    price: String(p.price),
    compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
    stock: String(p.stock),
    isFeatured: p.isFeatured,
    isBestseller: p.isBestseller,
    tags: p.tags.join(', '),
    imageUrl: p.images[0]?.url ?? '',
    imageAlt: p.images[0]?.alt ?? '',
  }
}

function formToPayload(form: ProductFormData) {
  return {
    title: form.title,
    description: form.description,
    brand: form.brand,
    category: form.category,
    price: parseFloat(form.price),
    compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
    stock: parseInt(form.stock, 10),
    isFeatured: form.isFeatured,
    isBestseller: form.isBestseller,
    tags: form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    images: form.imageUrl ? [{ url: form.imageUrl, alt: form.imageAlt || form.title }] : [],
  }
}

function ProductDrawer({
  product,
  categories,
  onClose,
}: {
  product: ProductDTO | null
  categories: CategoryDTO[]
  onClose: () => void
}) {
  const [form, setForm] = useState<ProductFormData>(product ? productToForm(product) : EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const create = useAdminCreateProduct()
  const update = useAdminUpdateProduct()

  const isPending = create.isPending || update.isPending

  function set<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleImageUpload(file: File) {
    setUploading(true)
    setError('')
    try {
      const params = await adminApi.signUpload('lumora/products')
      const fd = new FormData()
      fd.append('file', file)
      fd.append('signature', params.signature)
      fd.append('timestamp', String(params.timestamp))
      fd.append('api_key', params.apiKey)
      fd.append('folder', params.folder)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`, {
        method: 'POST',
        body: fd,
      })
      const data = (await res.json()) as { secure_url: string; original_filename: string }
      set('imageUrl', data.secure_url)
      set('imageAlt', data.original_filename ?? form.title)
    } catch {
      setError('Image upload failed. You can paste a URL manually instead.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const payload = formToPayload(form)
    try {
      if (product) {
        await update.mutateAsync({ id: product._id, data: payload })
      } else {
        await create.mutateAsync(payload)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label={product ? 'Edit product' : 'Create product'}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative ml-auto w-full max-w-lg glass border-l border-[var(--border)] flex flex-col h-full overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] sticky top-0 glass z-10">
          <h2 className="font-semibold">{product ? 'Edit product' : 'New product'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 text-[var(--muted)]"
            aria-label="Close drawer"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-4">
          {error && (
            <div
              className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger"
              role="alert"
            >
              {error}
            </div>
          )}

          <Input
            label="Title"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
            disabled={isPending}
          />
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              required
              disabled={isPending}
              className="w-full glass border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-violet disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Brand"
              value={form.brand}
              onChange={(e) => set('brand', e.target.value)}
              required
              disabled={isPending}
            />
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                required
                disabled={isPending}
                className="w-full glass border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet disabled:opacity-60 text-[var(--text)]"
              >
                <option value="" style={{ background: 'var(--bg)' }}>
                  Select…
                </option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id} style={{ background: 'var(--bg)' }}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Price ($)"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              required
              disabled={isPending}
            />
            <Input
              label="Compare at ($)"
              type="number"
              min="0"
              step="0.01"
              value={form.compareAtPrice}
              onChange={(e) => set('compareAtPrice', e.target.value)}
              disabled={isPending}
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) => set('stock', e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <Input
            label="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
            placeholder="luxury, new, sale"
            disabled={isPending}
          />

          {/* Image upload */}
          <div>
            <p className="text-xs font-medium text-[var(--muted)] mb-1.5">Product image</p>
            {form.imageUrl && (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden mb-2 bg-white/5">
                <Image
                  src={form.imageUrl}
                  alt={form.imageAlt || 'Product'}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            )}
            <div className="flex gap-2">
              <label
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all cursor-pointer',
                  uploading
                    ? 'opacity-50 cursor-wait border-[var(--border)]'
                    : 'border-[var(--border)] hover:border-violet/40 text-[var(--muted)] hover:text-[var(--text)]'
                )}
              >
                <Upload size={14} aria-hidden="true" />
                {uploading ? 'Uploading…' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading || isPending}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleImageUpload(file)
                  }}
                  aria-label="Upload image file"
                />
              </label>
              <Input
                label=""
                placeholder="Or paste URL"
                value={form.imageUrl}
                onChange={(e) => set('imageUrl', e.target.value)}
                disabled={isPending}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => set('isFeatured', e.target.checked)}
                className="w-4 h-4 rounded accent-violet"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.isBestseller}
                onChange={(e) => set('isBestseller', e.target.checked)}
                className="w-4 h-4 rounded accent-violet"
              />
              Bestseller
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 btn-primary py-3 justify-center disabled:opacity-60"
            >
              {isPending ? 'Saving…' : product ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  )
}

export default function AdminProductsPage() {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [tab, setTab] = useState<'all' | 'low-stock'>('all')
  const [drawerProduct, setDrawerProduct] = useState<ProductDTO | null | 'new'>(null)
  const { data, isLoading } = useProducts(
    tab === 'low-stock' ? { limit: 200 } : { q: q || undefined, page, limit: 20 }
  )
  const { data: categoriesData } = useCategories()
  const deleteProduct = useAdminDeleteProduct()

  const allProducts = data?.products ?? []
  const products = tab === 'low-stock' ? allProducts.filter((p) => p.stock <= 5) : allProducts
  const meta = tab === 'all' ? data?.meta : undefined
  const categories = (categoriesData as CategoryDTO[] | undefined) ?? []
  const lowStockCount = allProducts.filter((p) => p.stock <= 5).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Products</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Create, edit, and manage your catalog
          </p>
        </div>
        <button type="button" onClick={() => setDrawerProduct('new')} className="btn-primary gap-2">
          <Plus size={16} aria-hidden="true" />
          New product
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-xl p-1 w-fit">
        {(['all', 'low-stock'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t)
              setPage(1)
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all',
              t === tab ? 'bg-violet text-white' : 'text-[var(--muted)] hover:text-[var(--text)]'
            )}
          >
            {t === 'all' ? 'All products' : 'Low stock'}
            {t === 'low-stock' && tab !== 'low-stock' && lowStockCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-danger/90 text-white text-[10px] font-bold flex items-center justify-center">
                {lowStockCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'all' && (
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search products…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            className="w-full pl-9 pr-4 py-2 text-sm glass border border-[var(--border)] rounded-xl focus:outline-none focus:border-violet"
            aria-label="Search products"
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 skeleton rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-[var(--muted)]">No products found</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-xs text-[var(--muted)] font-medium">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-xs text-[var(--muted)] font-medium">
                  Category
                </th>
                <th className="text-right px-4 py-3 text-xs text-[var(--muted)] font-medium">
                  Price
                </th>
                <th className="text-right px-4 py-3 text-xs text-[var(--muted)] font-medium">
                  Stock
                </th>
                <th className="text-left px-4 py-3 text-xs text-[var(--muted)] font-medium">
                  Flags
                </th>
                <th className="text-right px-4 py-3 text-xs text-[var(--muted)] font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-white/3 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images[0] && (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/5 shrink-0">
                          <Image
                            src={product.images[0].url}
                            alt={product.images[0].alt || product.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate max-w-[180px]">
                          {product.title}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">
                    {typeof product.category === 'object' ? product.category.name : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-sm">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        'text-xs font-medium',
                        product.stock === 0
                          ? 'text-danger'
                          : product.stock <= 5
                            ? 'text-warning'
                            : 'text-success'
                      )}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {product.isFeatured && (
                        <Badge variant="violet" className="text-[10px]">
                          Featured
                        </Badge>
                      )}
                      {product.isBestseller && (
                        <Badge variant="cyan" className="text-[10px]">
                          Bestseller
                        </Badge>
                      )}
                      {!product.isActive && (
                        <Badge variant="danger" className="text-[10px]">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDrawerProduct(product)}
                        className="p-2 rounded-lg hover:bg-white/5 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                        aria-label={`Edit ${product.title}`}
                      >
                        <Pencil size={14} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete "${product.title}"? This cannot be undone.`)) {
                            deleteProduct.mutate(product._id)
                          }
                        }}
                        disabled={deleteProduct.isPending}
                        className="p-2 rounded-lg hover:bg-danger/10 text-[var(--muted)] hover:text-danger transition-colors disabled:opacity-50"
                        aria-label={`Delete ${product.title}`}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-xl text-xs glass border border-[var(--border)] disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-3 py-1.5 text-xs text-[var(--muted)]">
            {page} / {meta.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="px-3 py-1.5 rounded-xl text-xs glass border border-[var(--border)] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {drawerProduct !== null && (
        <ProductDrawer
          product={drawerProduct === 'new' ? null : drawerProduct}
          categories={categories}
          onClose={() => setDrawerProduct(null)}
        />
      )}
    </div>
  )
}
