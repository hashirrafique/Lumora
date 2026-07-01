'use client'

export const dynamic = 'force-dynamic'

import { useState, useId, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, CreditCard, Package, MapPin, ClipboardList, PartyPopper } from 'lucide-react'
import { Stepper } from '@/components/ui/Stepper'
import { Input } from '@/components/ui/Input'
import { useCart } from '@/lib/hooks/useCart'
import { usePlaceOrder } from '@/lib/hooks/useOrders'
import { useAuthStore } from '@/store/auth.store'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { spring, ease, duration as dur } from '@/lib/motion'
import type { AddressDTO, CheckoutInput } from '@/lib/api'
import { cn } from '@/lib/utils'

const STEPS = ['Address', 'Shipping', 'Payment', 'Review']

const SHIPPING_OPTIONS = [
  { name: 'Standard', price: 0, etaDays: 7, label: 'Free · 5–7 business days' },
  { name: 'Express', price: 9.99, etaDays: 3, label: '$9.99 · 2–3 business days' },
  { name: 'Overnight', price: 24.99, etaDays: 1, label: '$24.99 · Next business day' },
]

function formatCard(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}
function formatExp(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

export default function CheckoutPage() {
  const user = useAuthStore((s) => s.user)
  const { data: cart, isLoading: cartLoading } = useCart()
  const placeOrder = usePlaceOrder()
  const idempotencyKey = useId()
  const reduced = useReducedMotion()

  const [step, setStep] = useState(0)
  const [placedOrderNumber, setPlacedOrderNumber] = useState('')
  const [placedOrderTotal, setPlacedOrderTotal] = useState(0)

  const [address, setAddress] = useState<Partial<AddressDTO>>({
    fullName: user?.name ?? '',
    country: 'United States',
    isDefault: false,
  })
  const [shipping, setShipping] = useState(SHIPPING_OPTIONS[0]!)
  const [payment, setPayment] = useState({ number: '', exp: '', cvc: '', name: '' })
  const [cardDisplay, setCardDisplay] = useState('')
  const [orderError, setOrderError] = useState('')
  const [prevStep, setPrevStep] = useState(0)

  // Confetti on success
  useEffect(() => {
    if (step !== 4 || !placedOrderNumber || reduced) return
    let cancelled = false
    void (async () => {
      const { default: confetti } = await import('canvas-confetti')
      if (cancelled) return
      void confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#7C5CFF', '#22D3EE', '#ffffff', '#F0ABFC'],
        disableForReducedMotion: true,
      })
    })()
    return () => {
      cancelled = true
    }
  }, [step, placedOrderNumber, reduced])

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
        <h1 className="font-display font-semibold text-2xl">Sign in to checkout</h1>
        <p className="text-[var(--muted)]">You need an account to complete your purchase.</p>
        <Link href="/login?redirect=/checkout" className="btn-primary mx-auto">
          Sign in
        </Link>
      </div>
    )
  }

  if (!cartLoading && (!cart || cart.items.length === 0)) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
        <h1 className="font-display font-semibold text-2xl">Your cart is empty</h1>
        <Link href="/shop" className="btn-primary mx-auto">
          Browse shop
        </Link>
      </div>
    )
  }

  const goToStep = (next: number) => {
    setPrevStep(step)
    setStep(next)
  }

  const addrValid =
    !!address.fullName &&
    !!address.phone &&
    !!address.line1 &&
    !!address.city &&
    !!address.postalCode &&
    !!address.country

  const cardDigits = payment.number.replace(/\s/g, '')
  const paymentValid =
    cardDigits.length >= 13 &&
    !!payment.exp.match(/^\d{2}\/\d{2}$/) &&
    payment.cvc.length >= 3 &&
    !!payment.name

  async function handlePlaceOrder() {
    setOrderError('')
    const input: CheckoutInput = {
      shippingAddress: address as AddressDTO,
      shippingMethod: { name: shipping.name, price: shipping.price, etaDays: shipping.etaDays },
      payment: { number: cardDigits, exp: payment.exp, cvc: payment.cvc, name: payment.name },
    }
    try {
      const order = await placeOrder.mutateAsync({ input, idempotencyKey })
      setPlacedOrderTotal(cart?.total ?? 0)
      setPlacedOrderNumber(order.orderNumber)
      goToStep(4)
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Order failed. Please try again.')
    }
  }

  const dir = step > prevStep ? 1 : -1

  // ── Success screen ─────────────────────────────────────────────────────────
  if (step === 4 && placedOrderNumber) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={spring.bouncy}
            className="space-y-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ ...spring.bouncy, delay: 0.15 }}
              className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto"
            >
              <CheckCircle size={36} className="text-success" aria-hidden="true" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: dur.base, ease: ease.out }}
              className="space-y-3"
            >
              <h1 className="font-display font-semibold text-3xl">You&apos;re all set!</h1>
              <div className="flex items-center justify-center gap-1">
                <p className="text-[var(--muted)]">Order</p>
                <span
                  className="text-violet font-mono font-semibold"
                  aria-label={`Order number: ${placedOrderNumber}`}
                >
                  {placedOrderNumber.split('').map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.04, ease: ease.out, duration: dur.fast }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
                <p className="text-[var(--muted)]">confirmed!</p>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-sm text-[var(--muted)]">
                <PartyPopper size={14} className="text-violet" aria-hidden="true" />
                On its way to you
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: dur.base, ease: ease.out }}
              className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
            >
              <Link href={`/account/orders/${placedOrderNumber}`} className="btn-primary">
                Track order
              </Link>
              <Link
                href="/shop"
                className="glass rounded-xl px-6 py-2.5 text-sm font-medium border border-[var(--border)] hover:border-violet/40 transition-colors text-center"
              >
                Continue shopping
              </Link>
            </motion.div>

            {placedOrderTotal > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: dur.base, ease: ease.out }}
                className="glass rounded-2xl px-6 py-4 border border-violet/20 text-center"
              >
                <p className="text-sm text-[var(--muted)]">
                  You&apos;ve earned{' '}
                  <strong className="text-violet font-semibold">
                    {Math.round(placedOrderTotal * 4)} Lumora Points
                  </strong>{' '}
                  — redeemable on your next order!
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display font-semibold text-2xl mb-8">Checkout</h1>

      <Stepper steps={STEPS} current={step} className="mb-10" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main step content ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -24 }}
              transition={{ duration: dur.base, ease: ease.out }}
            >
              {/* Step 0 — Address */}
              {step === 0 && (
                <div className="glass rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={18} className="text-violet" aria-hidden="true" />
                    <h2 className="font-semibold">Shipping address</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full name"
                      value={address.fullName ?? ''}
                      onChange={(e) => setAddress((a) => ({ ...a, fullName: e.target.value }))}
                      autoComplete="name"
                      required
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      value={address.phone ?? ''}
                      onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                      autoComplete="tel"
                      required
                    />
                  </div>
                  <Input
                    label="Address line 1"
                    value={address.line1 ?? ''}
                    onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                    autoComplete="address-line1"
                    required
                  />
                  <Input
                    label="Address line 2 (optional)"
                    value={address.line2 ?? ''}
                    onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))}
                    autoComplete="address-line2"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      value={address.city ?? ''}
                      onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                      autoComplete="address-level2"
                      required
                    />
                    <Input
                      label="State / Province"
                      value={address.state ?? ''}
                      onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                      autoComplete="address-level1"
                    />
                    <Input
                      label="Postal code"
                      value={address.postalCode ?? ''}
                      onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))}
                      autoComplete="postal-code"
                      required
                    />
                  </div>
                  <Input
                    label="Country"
                    value={address.country ?? ''}
                    onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
                    autoComplete="country-name"
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      disabled={!addrValid}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to shipping
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1 — Shipping */}
              {step === 1 && (
                <div className="glass rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={18} className="text-violet" aria-hidden="true" />
                    <h2 className="font-semibold">Shipping method</h2>
                  </div>
                  <fieldset className="space-y-3">
                    <legend className="sr-only">Choose shipping method</legend>
                    {SHIPPING_OPTIONS.map((opt) => (
                      <label
                        key={opt.name}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all',
                          shipping.name === opt.name
                            ? 'border-violet/50 bg-violet/5'
                            : 'border-[var(--border)] hover:border-violet/30'
                        )}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={opt.name}
                          checked={shipping.name === opt.name}
                          onChange={() => setShipping(opt)}
                          className="accent-violet"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{opt.name}</p>
                          <p className="text-xs text-[var(--muted)]">{opt.label}</p>
                        </div>
                        <span className="text-sm font-semibold">
                          {opt.price === 0 ? 'Free' : `$${opt.price.toFixed(2)}`}
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => goToStep(0)}
                      className="text-sm text-[var(--muted)] hover:text-[var(--text)]"
                    >
                      ← Back
                    </button>
                    <button type="button" onClick={() => goToStep(2)} className="btn-primary">
                      Continue to payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 — Payment */}
              {step === 2 && (
                <div className="glass rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={18} className="text-violet" aria-hidden="true" />
                    <h2 className="font-semibold">Payment</h2>
                  </div>
                  <p className="text-xs text-[var(--muted)] bg-violet/5 border border-violet/20 rounded-xl px-3 py-2">
                    This is a simulated checkout. Use any valid-format card number. Card ending{' '}
                    <strong>0002</strong> simulates a decline.
                  </p>
                  <Input
                    label="Cardholder name"
                    value={payment.name}
                    onChange={(e) => setPayment((p) => ({ ...p, name: e.target.value }))}
                    autoComplete="cc-name"
                    required
                  />
                  <Input
                    label="Card number"
                    value={cardDisplay}
                    onChange={(e) => {
                      const formatted = formatCard(e.target.value)
                      setCardDisplay(formatted)
                      setPayment((p) => ({ ...p, number: formatted.replace(/\s/g, '') }))
                    }}
                    placeholder="1234 5678 9012 3456"
                    autoComplete="cc-number"
                    inputMode="numeric"
                    maxLength={19}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry (MM/YY)"
                      value={payment.exp}
                      onChange={(e) =>
                        setPayment((p) => ({ ...p, exp: formatExp(e.target.value) }))
                      }
                      placeholder="MM/YY"
                      autoComplete="cc-exp"
                      inputMode="numeric"
                      maxLength={5}
                      required
                    />
                    <Input
                      label="CVC"
                      value={payment.cvc}
                      onChange={(e) =>
                        setPayment((p) => ({
                          ...p,
                          cvc: e.target.value.replace(/\D/g, '').slice(0, 4),
                        }))
                      }
                      placeholder="123"
                      autoComplete="cc-csc"
                      inputMode="numeric"
                      maxLength={4}
                      required
                    />
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="text-sm text-[var(--muted)] hover:text-[var(--text)]"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      disabled={!paymentValid}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Review order
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 — Review */}
              {step === 3 && (
                <div className="glass rounded-3xl p-6 space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList size={18} className="text-violet" aria-hidden="true" />
                    <h2 className="font-semibold">Review your order</h2>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Shipping to</p>
                      <button
                        type="button"
                        onClick={() => goToStep(0)}
                        className="text-xs text-violet hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-[var(--muted)]">{address.fullName}</p>
                    <p className="text-[var(--muted)]">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ''}
                    </p>
                    <p className="text-[var(--muted)]">
                      {address.city}
                      {address.state ? `, ${address.state}` : ''} {address.postalCode}
                    </p>
                    <p className="text-[var(--muted)]">{address.country}</p>
                  </div>

                  <div className="border-t border-[var(--border)] pt-4 space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{shipping.name} shipping</p>
                      <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className="text-xs text-violet hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-[var(--muted)]">{shipping.label}</p>
                  </div>

                  <div className="border-t border-[var(--border)] pt-4 space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Payment</p>
                      <button
                        type="button"
                        onClick={() => goToStep(2)}
                        className="text-xs text-violet hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-[var(--muted)]">•••• •••• •••• {payment.number.slice(-4)}</p>
                  </div>

                  {orderError && (
                    <div
                      className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger"
                      role="alert"
                    >
                      {orderError}
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="text-sm text-[var(--muted)] hover:text-[var(--text)]"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => void handlePlaceOrder()}
                      disabled={placeOrder.isPending}
                      className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed min-w-32"
                    >
                      {placeOrder.isPending ? 'Processing…' : 'Place order'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Order summary sidebar ─────────────────────────────────────────── */}
        {cart && (
          <div className="glass rounded-3xl p-5 space-y-4 h-fit">
            <h2 className="font-semibold">Order summary</h2>
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {cart.items.map((item) => (
                <div
                  key={`${item.product._id}-${item.variant?.value ?? ''}`}
                  className="flex gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 shrink-0 overflow-hidden">
                    {item.product.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1">{item.product.title}</p>
                    {item.variant && (
                      <p className="text-xs text-[var(--muted)]">{item.variant.value}</p>
                    )}
                    <p className="text-xs text-[var(--muted)]">Qty {item.qty}</p>
                  </div>
                  <p className="text-xs font-semibold shrink-0">
                    ${(item.product.price * item.qty).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 text-sm border-t border-[var(--border)] pt-3">
              <div className="flex justify-between text-[var(--muted)]">
                <span>Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-${cart.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--muted)]">
                <span>Shipping</span>
                <span>
                  {step >= 1
                    ? shipping.price === 0
                      ? 'Free'
                      : `$${shipping.price.toFixed(2)}`
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-[var(--text)] pt-1.5 border-t border-[var(--border)]">
                <span>Total</span>
                <span>${(cart.total - cart.shipping + shipping.price).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
