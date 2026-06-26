# 02 — Data Models (Mongoose)

Strict schemas, `timestamps:true`, lean reads where possible. Put shared DTO types in `packages/types`. Indexes listed per model — create them.

## User
```ts
{
  name: string (req, 2–60),
  email: string (req, unique, lowercase, indexed),
  passwordHash: string (req, select:false),
  role: "customer" | "admin" (default "customer", indexed),
  avatarUrl?: string,
  addresses: [Address],          // embedded, see below
  refreshTokenHash?: string (select:false),   // for rotation
  isBanned: boolean (default false),
  resetTokenHash?: string (select:false),
  resetTokenExp?: Date,
}
// indexes: email (unique), role
// methods: comparePassword(plain), toSafeJSON() (strips hash/tokens)
```

### Address (embedded subdoc)
```ts
{ label?: string, fullName: string, phone: string, line1: string, line2?: string,
  city: string, state?: string, postalCode: string, country: string, isDefault: boolean }
```

## Category
```ts
{ name: string (req, unique), slug: string (req, unique, indexed),
  description?: string, imageUrl?: string, order: number (default 0) }
// slug unique index
```

## Product
```ts
{
  title: string (req, indexed text),
  slug: string (req, unique, indexed),
  description: string (req, indexed text),
  brand: string (req, indexed),
  category: ObjectId<Category> (req, indexed),
  price: number (req, min 0),               // current price (USD)
  compareAtPrice?: number,                  // for "was" / discount %
  currency: "USD" (default),
  images: [{ url: string, alt: string }],   // 1..n, first = primary
  variants: [{                              // optional
    name: string,                           // e.g. "Color"
    options: [{ label: string, value: string, hex?: string, stockDelta?: number }]
  }],
  specs: [{ key: string, value: string }],  // spec table rows
  tags: [string] (indexed),
  stock: number (req, min 0, default 0),
  ratingAvg: number (default 0),            // denormalized
  ratingCount: number (default 0),
  soldCount: number (default 0),            // for "popularity" sort
  isFeatured: boolean (default false, indexed),
  isBestseller: boolean (default false),
  isActive: boolean (default true, indexed),
}
// indexes: slug (unique), category, brand, tags, isFeatured, isActive,
//          text index on (title, description, brand) for search,
//          compound: { category:1, price:1 }, { isActive:1, soldCount:-1 }
// pre-save: generate slug from title (unique-safe)
```

## Cart  (one per user; guests use client localStorage merged on login)
```ts
{ user: ObjectId<User> (req, unique, indexed),
  items: [{ product: ObjectId<Product>, qty: number(min 1), variant?: {name,value} }],
  coupon?: ObjectId<Coupon> }
// populate product on read; recompute totals server-side, never trust client totals
```

## Wishlist
```ts
{ user: ObjectId<User> (req, unique, indexed), products: [ObjectId<Product>] }
```

## Coupon
```ts
{ code: string (req, unique, uppercase, indexed),
  type: "percent" | "fixed",
  value: number (req),                 // 10 => 10% or $10
  minSubtotal: number (default 0),
  maxUses?: number, usedCount: number (default 0),
  expiresAt?: Date, isActive: boolean (default true) }
// validation endpoint checks active + not expired + minSubtotal + uses left
```

## Order
```ts
{
  orderNumber: string (req, unique, indexed),   // e.g. LUM-7F3K9Q
  user: ObjectId<User> (req, indexed),
  items: [{                                     // snapshot at purchase time
    product: ObjectId<Product>, title: string, image: string,
    price: number, qty: number, variant?: {name,value}
  }],
  shippingAddress: Address (embedded snapshot),
  subtotal: number, discount: number, shipping: number, total: number,
  couponCode?: string,
  payment: { method: "simulated", brandGuess?: string, last4?: string, status: "paid" },
  status: "placed" | "packed" | "shipped" | "delivered" | "cancelled"
          (default "placed", indexed),
  statusHistory: [{ status: string, at: Date }],
  shippingMethod: { name: string, price: number, etaDays: number },
}
// indexes: orderNumber (unique), user, status, createdAt(-1)
// on status change → push statusHistory + emit socket "order:status" to user room
```

## Review
```ts
{ product: ObjectId<Product> (req, indexed),
  user: ObjectId<User> (req),
  rating: number (req, 1–5),
  title?: string, body: string (req),
  isVerifiedPurchase: boolean (default false),  // true if user has a delivered order with this product
  isApproved: boolean (default true),           // admin can unapprove
}
// indexes: product, { product:1, user:1 } unique (one review per user/product)
// on create/delete/moderate → recompute Product.ratingAvg & ratingCount (aggregation)
```

## Integrity rules
- Checkout is a **transaction-like flow**: validate stock for every item → create order → `$inc` stock down + `$inc` soldCount up → clear cart. If any item is out of stock, fail the whole checkout with a clear error (never partially fulfill).
- All money math happens **server-side** from DB prices; the client never sets totals.
- `ratingAvg`/`ratingCount`/`soldCount` are denormalized for fast sorts — keep them correct via the hooks above.
