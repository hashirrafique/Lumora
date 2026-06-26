import { Category } from '../models/category.model'
import { ApiError } from '../utils/ApiError'
import { toSlug } from '../utils/slug'

export async function listCategories(): Promise<unknown[]> {
  return Category.find().sort({ order: 1, name: 1 }).lean()
}

export async function getCategoryBySlug(slug: string): Promise<unknown> {
  const cat = await Category.findOne({ slug }).lean()
  if (!cat) throw ApiError.notFound('Category')
  return cat
}

export async function createCategory(input: {
  name: string
  description?: string
  imageUrl?: string
  order?: number
}): Promise<unknown> {
  const slug = toSlug(input.name)
  const existing = await Category.findOne({ slug }).lean()
  if (existing) throw ApiError.conflict('Category with this name already exists')
  const cat = new Category({ ...input, slug })
  await cat.save()
  return cat.toObject()
}

export async function updateCategory(
  id: string,
  input: { name?: string; description?: string; imageUrl?: string; order?: number }
): Promise<unknown> {
  const cat = await Category.findById(id)
  if (!cat) throw ApiError.notFound('Category')
  if (input.name && input.name !== cat.name) {
    const slug = toSlug(input.name)
    const dup = await Category.findOne({ slug, _id: { $ne: id } }).lean()
    if (dup) throw ApiError.conflict('Category name taken')
    Object.assign(cat, { ...input, slug })
  } else {
    Object.assign(cat, input)
  }
  await cat.save()
  return cat.toObject()
}

export async function deleteCategory(id: string): Promise<void> {
  const result = await Category.findByIdAndDelete(id)
  if (!result) throw ApiError.notFound('Category')
}
