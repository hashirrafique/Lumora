import { User } from '../models/user.model'
import { ApiError } from '../utils/ApiError'
import type { PaginationMeta } from '@lumora/types'

export async function listUsers(
  q: string | undefined,
  role: string | undefined,
  page: number,
  limit: number
): Promise<{ users: unknown[]; meta: PaginationMeta }> {
  const filter: Record<string, unknown> = {}
  if (q) filter['$or'] = [
    { name: { $regex: new RegExp(q, 'i') } },
    { email: { $regex: new RegExp(q, 'i') } },
  ]
  if (role) filter['role'] = role

  const skip = (page - 1) * limit
  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('name email role avatarUrl isBanned createdAt')
      .lean(),
    User.countDocuments(filter),
  ])

  return { users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function updateUserAdmin(
  id: string,
  payload: { role?: 'customer' | 'admin'; isBanned?: boolean }
): Promise<unknown> {
  const user = await User.findById(id)
  if (!user) throw ApiError.notFound('User')

  if (payload.role !== undefined) user.role = payload.role
  if (payload.isBanned !== undefined) user.isBanned = payload.isBanned
  await user.save()

  return user.toSafeJSON()
}
