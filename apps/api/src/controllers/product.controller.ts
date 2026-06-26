import type { Request, Response } from 'express'
import * as productService from '../services/product.service'
import { sendSuccess, sendCreated } from '../utils/response'
import { asyncHandler } from '../utils/asyncHandler'

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { products, meta } = await productService.listProducts(req.query as never)
  sendSuccess(res, products, 200, meta)
})

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string }
  const product = await productService.getProductBySlug(slug)
  sendSuccess(res, product)
})

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body)
  sendCreated(res, product)
})

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const product = await productService.updateProduct(id, req.body)
  sendSuccess(res, product)
})

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  await productService.deleteProduct(id)
  sendSuccess(res, { deleted: true })
})

export const getFeatured = asyncHandler(async (_req: Request, res: Response) => {
  const products = await productService.getFeaturedProducts()
  sendSuccess(res, products)
})

export const getBestsellers = asyncHandler(async (_req: Request, res: Response) => {
  const products = await productService.getBestsellers()
  sendSuccess(res, products)
})
