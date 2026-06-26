import { Product } from '../models/product.model'

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100)
}

export async function uniqueSlug(title: string, existingId?: string): Promise<string> {
  let base = toSlug(title)
  let slug = base
  let counter = 0

  while (true) {
    const query = Product.findOne({ slug })
    if (existingId) {
      query.where('_id').ne(existingId)
    }
    const existing = await query.lean()
    if (!existing) return slug
    counter++
    slug = `${base}-${counter}`
  }
}
