import type { Request, Response } from 'express'
import * as cartService from '../services/cart.service'
import { sendSuccess } from '../utils/response'
import { asyncHandler } from '../utils/asyncHandler'

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.getCart(req.user!.id)
  sendSuccess(res, cart)
})

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.addItem(req.user!.id, req.body)
  sendSuccess(res, cart, 201)
})

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params as { productId: string }
  const { qty } = req.body as { qty: number }
  const { variantName, variantValue } = req.query as {
    variantName?: string
    variantValue?: string
  }
  const cart = await cartService.updateItem(
    req.user!.id,
    productId,
    qty,
    variantName,
    variantValue
  )
  sendSuccess(res, cart)
})

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params as { productId: string }
  const { variantName, variantValue } = req.query as {
    variantName?: string
    variantValue?: string
  }
  const cart = await cartService.removeItem(
    req.user!.id,
    productId,
    variantName,
    variantValue
  )
  sendSuccess(res, cart)
})

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.clearCart(req.user!.id)
  sendSuccess(res, cart)
})

export const applyCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body as { code: string }
  const cart = await cartService.applyCoupon(req.user!.id, code)
  sendSuccess(res, cart)
})

export const removeCoupon = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.removeCoupon(req.user!.id)
  sendSuccess(res, cart)
})

export const mergeCart = asyncHandler(async (req: Request, res: Response) => {
  const { items } = req.body as {
    items: Array<{
      productId: string
      qty: number
      variant?: { name: string; value: string }
    }>
  }
  const cart = await cartService.mergeGuestCart(req.user!.id, items)
  sendSuccess(res, cart)
})
