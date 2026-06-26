/**
 * Filter → URL sync tests.
 *
 * The shop page encodes all active filters into URL search params and reads
 * them back on load. These tests verify the round-trip logic is correct by
 * exercising the pure URL-manipulation utilities directly.
 */
import { describe, it, expect } from 'vitest'

// ── Replication of setParam / buildFilters from shop/page.tsx ─────────────────
// These are pure functions of URLSearchParams; no React/router needed.

function setParam(
  current: URLSearchParams,
  key: string,
  value: string | null
): URLSearchParams {
  const sp = new URLSearchParams(current.toString())
  if (value === null || value === '') {
    sp.delete(key)
  } else {
    sp.set(key, value)
  }
  sp.delete('page') // reset pagination on filter change
  return sp
}

function buildFilters(params: URLSearchParams) {
  return {
    q: params.get('q') ?? undefined,
    category: params.get('category') ?? undefined,
    brand: params.get('brand') ?? undefined,
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    minRating: params.get('minRating') ? Number(params.get('minRating')) : undefined,
    inStock: params.get('inStock') === 'true' ? true : undefined,
    sort: params.get('sort') ?? undefined,
    page: params.get('page') ? Number(params.get('page')) : 1,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Filter → URL sync', () => {
  describe('setParam', () => {
    it('adds a new param to an empty search string', () => {
      const result = setParam(new URLSearchParams(), 'category', 'audio')
      expect(result.get('category')).toBe('audio')
    })

    it('updates an existing param', () => {
      const sp = new URLSearchParams('category=electronics')
      const result = setParam(sp, 'category', 'audio')
      expect(result.get('category')).toBe('audio')
    })

    it('removes a param when value is null', () => {
      const sp = new URLSearchParams('category=electronics&sort=newest')
      const result = setParam(sp, 'category', null)
      expect(result.has('category')).toBe(false)
      expect(result.get('sort')).toBe('newest') // other params preserved
    })

    it('removes a param when value is empty string', () => {
      const sp = new URLSearchParams('category=electronics')
      const result = setParam(sp, 'category', '')
      expect(result.has('category')).toBe(false)
    })

    it('resets the page param whenever a filter changes', () => {
      const sp = new URLSearchParams('category=electronics&page=3')
      const result = setParam(sp, 'sort', 'price_asc')
      expect(result.has('page')).toBe(false)
    })

    it('preserves other params when setting a new one', () => {
      const sp = new URLSearchParams('sort=newest&inStock=true')
      const result = setParam(sp, 'minPrice', '50')
      expect(result.get('sort')).toBe('newest')
      expect(result.get('inStock')).toBe('true')
      expect(result.get('minPrice')).toBe('50')
    })
  })

  describe('buildFilters', () => {
    it('returns all undefined for an empty URL', () => {
      const f = buildFilters(new URLSearchParams())
      expect(f.q).toBeUndefined()
      expect(f.category).toBeUndefined()
      expect(f.inStock).toBeUndefined()
      expect(f.page).toBe(1) // defaults to 1
    })

    it('parses text search query', () => {
      const f = buildFilters(new URLSearchParams('q=wireless+earbuds'))
      expect(f.q).toBe('wireless earbuds')
    })

    it('parses numeric price range', () => {
      const f = buildFilters(new URLSearchParams('minPrice=50&maxPrice=200'))
      expect(f.minPrice).toBe(50)
      expect(f.maxPrice).toBe(200)
    })

    it('parses inStock boolean filter', () => {
      expect(buildFilters(new URLSearchParams('inStock=true')).inStock).toBe(true)
      expect(buildFilters(new URLSearchParams('inStock=false')).inStock).toBeUndefined()
      expect(buildFilters(new URLSearchParams()).inStock).toBeUndefined()
    })

    it('parses page number, defaulting to 1', () => {
      expect(buildFilters(new URLSearchParams('page=3')).page).toBe(3)
      expect(buildFilters(new URLSearchParams()).page).toBe(1)
    })

    it('parses a full filter state round-trip', () => {
      const sp = new URLSearchParams(
        'q=headphones&category=audio&brand=SonicLab&minPrice=50&maxPrice=300&minRating=4&inStock=true&sort=price_asc&page=2'
      )
      const f = buildFilters(sp)
      expect(f).toMatchObject({
        q: 'headphones',
        category: 'audio',
        brand: 'SonicLab',
        minPrice: 50,
        maxPrice: 300,
        minRating: 4,
        inStock: true,
        sort: 'price_asc',
        page: 2,
      })
    })
  })

  describe('URL round-trip', () => {
    it('applying multiple filters produces a consistent, parseable URL', () => {
      let sp = new URLSearchParams()
      sp = setParam(sp, 'category', 'audio')
      sp = setParam(sp, 'inStock', 'true')
      sp = setParam(sp, 'sort', 'price_asc')
      sp = setParam(sp, 'minPrice', '100')

      const filters = buildFilters(sp)
      expect(filters.category).toBe('audio')
      expect(filters.inStock).toBe(true)
      expect(filters.sort).toBe('price_asc')
      expect(filters.minPrice).toBe(100)
    })

    it('clearing a filter removes it from the parsed output', () => {
      let sp = new URLSearchParams('category=audio&sort=newest')
      sp = setParam(sp, 'category', null) // clear category

      const filters = buildFilters(sp)
      expect(filters.category).toBeUndefined()
      expect(filters.sort).toBe('newest') // sort still present
    })

    it('back-button state: URL params restore filters exactly', () => {
      // Simulate user applies filters → serialized to URL → restores from URL
      const original = {
        q: 'sony',
        category: 'electronics',
        minPrice: 200,
        inStock: true,
        sort: 'rating',
        page: 1,
      }
      // Build URL as the router would
      const sp = new URLSearchParams()
      if (original.q) sp.set('q', original.q)
      if (original.category) sp.set('category', original.category)
      if (original.minPrice) sp.set('minPrice', String(original.minPrice))
      if (original.inStock) sp.set('inStock', 'true')
      if (original.sort) sp.set('sort', original.sort)

      // Restore from URL (as page load would)
      const restored = buildFilters(sp)
      expect(restored.q).toBe(original.q)
      expect(restored.category).toBe(original.category)
      expect(restored.minPrice).toBe(original.minPrice)
      expect(restored.inStock).toBe(original.inStock)
      expect(restored.sort).toBe(original.sort)
    })
  })
})
