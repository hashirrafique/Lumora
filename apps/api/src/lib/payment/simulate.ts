/**
 * Simulated payment processor.
 * Validates card data server-side (Luhn, expiry, CVC) and returns a result.
 * Real payment provider would replace this interface in production.
 */

export interface PaymentInput {
  number: string
  exp: string // MM/YY
  cvc: string
  name: string
}

export interface PaymentResult {
  success: boolean
  last4: string
  brandGuess: string
  errorMessage?: string
}

function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, '').split('').map(Number)
  let sum = 0
  let isEven = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i]!
    if (isEven) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    isEven = !isEven
  }
  return sum % 10 === 0
}

function guessCardBrand(num: string): string {
  const n = num.replace(/\D/g, '')
  if (/^4/.test(n)) return 'Visa'
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard'
  if (/^3[47]/.test(n)) return 'Amex'
  if (/^6(?:011|5)/.test(n)) return 'Discover'
  return 'Unknown'
}

function isExpired(exp: string): boolean {
  const [mm, yy] = exp.split('/')
  if (!mm || !yy) return true
  const expDate = new Date(2000 + parseInt(yy, 10), parseInt(mm, 10) - 1, 1)
  const now = new Date()
  // Expire at end of expiry month
  return expDate < new Date(now.getFullYear(), now.getMonth(), 1)
}

export function simulatePayment(input: PaymentInput): PaymentResult {
  const digits = input.number.replace(/\D/g, '')
  const last4 = digits.slice(-4)
  const brandGuess = guessCardBrand(digits)

  if (!luhnCheck(digits)) {
    return { success: false, last4, brandGuess, errorMessage: 'Invalid card number' }
  }
  if (isExpired(input.exp)) {
    return { success: false, last4, brandGuess, errorMessage: 'Card has expired' }
  }
  if (!/^\d{3,4}$/.test(input.cvc)) {
    return { success: false, last4, brandGuess, errorMessage: 'Invalid CVC' }
  }
  // Simulate decline on specific test cards
  if (digits.endsWith('0002')) {
    return { success: false, last4, brandGuess, errorMessage: 'Card declined' }
  }

  return { success: true, last4, brandGuess }
}
