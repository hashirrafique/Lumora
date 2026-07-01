'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Users, Package } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useAdminOverview, useAdminSales, useAdminTop } from '@/lib/hooks/useAdmin'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { cn } from '@/lib/utils'
import type { TopProductDTO } from '@/lib/api'

const DAYS_OPTIONS = [7, 14, 30, 90]

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-xs text-[var(--muted)]">—</span>
  const up = delta >= 0
  return (
    <span
      className={cn(
        'flex items-center gap-0.5 text-xs font-medium',
        up ? 'text-success' : 'text-danger'
      )}
    >
      {up ? (
        <TrendingUp size={12} aria-hidden="true" />
      ) : (
        <TrendingDown size={12} aria-hidden="true" />
      )}
      {Math.abs(delta)}%
    </span>
  )
}

function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  format = 'number',
}: {
  label: string
  value: number
  delta: number | null
  icon: React.ElementType
  format?: 'number' | 'currency'
}) {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted)]">{label}</p>
        <div className="w-9 h-9 rounded-xl bg-violet/15 flex items-center justify-center">
          <Icon size={16} className="text-violet" aria-hidden="true" />
        </div>
      </div>
      <p className="font-display font-bold text-2xl">
        <AnimatedNumber
          value={value}
          prefix={format === 'currency' ? '$' : ''}
          decimals={format === 'currency' ? 2 : 0}
          className="tabular-nums"
        />
      </p>
      <DeltaBadge delta={delta} />
    </div>
  )
}

export default function OverviewPage() {
  const [days, setDays] = useState(30)
  const { data: overview, isLoading: overviewLoading } = useAdminOverview(days)
  const { data: sales, isLoading: salesLoading } = useAdminSales(days)
  const { data: top } = useAdminTop()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Overview</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Store performance at a glance</p>
        </div>
        <div className="flex items-center gap-1 glass rounded-xl p-1">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                d === days ? 'bg-violet text-white' : 'text-[var(--muted)] hover:text-[var(--text)]'
              )}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      {overviewLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 h-32 skeleton" />
          ))}
        </div>
      ) : overview ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Revenue"
            value={overview.revenue}
            delta={overview.deltas.revenue}
            icon={DollarSign}
            format="currency"
          />
          <KpiCard
            label="Orders"
            value={overview.orders}
            delta={overview.deltas.orders}
            icon={ShoppingBag}
          />
          <KpiCard
            label="Avg. order value"
            value={overview.aov}
            delta={overview.deltas.aov}
            icon={Package}
            format="currency"
          />
          <KpiCard
            label="New users"
            value={overview.newUsers}
            delta={overview.deltas.newUsers}
            icon={Users}
          />
        </div>
      ) : null}

      {/* Sales chart */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-sm mb-6">Revenue over time</h2>
        {salesLoading ? (
          <div className="h-52 skeleton rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={sales ?? []} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--muted)' }}
                tickFormatter={(v: string) => {
                  const d = new Date(v)
                  return `${d.getMonth() + 1}/${d.getDate()}`
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted)' }}
                tickFormatter={(v: number) => `$${v}`}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: 12,
                }}
                formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, 'Revenue']}
                labelFormatter={(label) => new Date(String(label)).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#7C5CFF"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#7C5CFF' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top products */}
      {top && (
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-5">
            <h2 className="font-semibold text-sm mb-4">Top products</h2>
            <div className="space-y-3">
              {top.topProducts.map((p: TopProductDTO, i: number) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--muted)] w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {p.soldCount} sold · ${p.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="font-semibold text-sm mb-4">Top categories</h2>
            <div className="space-y-3">
              {top.topCategories.map((c, i) => (
                <div key={String(c._id)} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--muted)] w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {c.productCount} products · {c.totalSold} sold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
