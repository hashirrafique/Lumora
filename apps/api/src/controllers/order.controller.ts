import type { Request, Response } from 'express'
import * as orderService from '../services/order.service'
import { sendSuccess, sendCreated } from '../utils/response'
import { asyncHandler } from '../utils/asyncHandler'

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const idempotencyKey = req.headers['idempotency-key'] as string | undefined
  const order = await orderService.createOrder(req.user!.id, req.body, idempotencyKey)
  sendCreated(res, order)
})

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query['page'] ?? 1)
  const limit = Number(req.query['limit'] ?? 10)
  const { orders, meta } = await orderService.listOrders(req.user!.id, page, limit)
  sendSuccess(res, orders, 200, meta)
})

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderNumber } = req.params as { orderNumber: string }
  const order = await orderService.getOrder(
    orderNumber,
    req.user!.id,
    req.user!.role === 'admin'
  )
  sendSuccess(res, order)
})
