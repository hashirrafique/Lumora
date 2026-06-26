import type { Request, Response } from 'express'
import * as categoryService from '../services/category.service'
import { sendSuccess, sendCreated } from '../utils/response'
import { asyncHandler } from '../utils/asyncHandler'

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.listCategories()
  sendSuccess(res, categories)
})

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string }
  const category = await categoryService.getCategoryBySlug(slug)
  sendSuccess(res, category)
})

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body)
  sendCreated(res, category)
})

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const category = await categoryService.updateCategory(id, req.body)
  sendSuccess(res, category)
})

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  await categoryService.deleteCategory(id)
  sendSuccess(res, { deleted: true })
})
