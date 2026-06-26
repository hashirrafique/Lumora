import { Order } from '../models/order.model'
import { User } from '../models/user.model'
import { Product } from '../models/product.model'
import { Category } from '../models/category.model'

export async function getOverview(days: number) {
  const now = new Date()
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const prevSince = new Date(since.getTime() - days * 24 * 60 * 60 * 1000)

  const [current, previous, newUsers, prevNewUsers] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: prevSince, $lt: since }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    ]),
    User.countDocuments({ createdAt: { $gte: since } }),
    User.countDocuments({ createdAt: { $gte: prevSince, $lt: since } }),
  ])

  const cur = current[0] ?? { revenue: 0, orders: 0 }
  const prev = previous[0] ?? { revenue: 0, orders: 0 }
  const revenue = Math.round(cur.revenue * 100) / 100
  const orders = cur.orders
  const aov = orders > 0 ? Math.round((revenue / orders) * 100) / 100 : 0
  const prevRevenue = Math.round(prev.revenue * 100) / 100
  const prevOrders = prev.orders
  const prevAov = prevOrders > 0 ? Math.round((prevRevenue / prevOrders) * 100) / 100 : 0

  const delta = (cur: number, prev: number) =>
    prev === 0 ? null : Math.round(((cur - prev) / prev) * 1000) / 10

  return {
    revenue,
    orders,
    aov,
    newUsers,
    deltas: {
      revenue: delta(revenue, prevRevenue),
      orders: delta(orders, prevOrders),
      aov: delta(aov, prevAov),
      newUsers: delta(newUsers, prevNewUsers),
    },
  }
}

export async function getSalesTimeSeries(days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const rows = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  return rows.map((r) => ({
    date: r._id as string,
    revenue: Math.round((r.revenue as number) * 100) / 100,
    orders: r.orders as number,
  }))
}

export async function getTop() {
  const [topProducts, topCategories] = await Promise.all([
    Product.find({ isActive: true })
      .sort({ soldCount: -1 })
      .limit(5)
      .select('title price soldCount images slug')
      .lean(),
    Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products',
        },
      },
      {
        $project: {
          name: 1,
          slug: 1,
          productCount: { $size: '$products' },
          totalSold: { $sum: '$products.soldCount' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]),
  ])

  return { topProducts, topCategories }
}
