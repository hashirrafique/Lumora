import type { Request, Response } from 'express'
import * as wishlistService from '../services/wishlist.service'
import { sendSuccess } from '../utils/response'
import { asyncHandler } from '../utils/asyncHandler'

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await wishlistService.getWishlist(req.user!.id)
  sendSuccess(res, wishlist)
})

export const toggleWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.body as { productId: string }
  const result = await wishlistService.toggleWishlist(req.user!.id, productId)
  sendSuccess(res, result)
})
