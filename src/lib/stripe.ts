import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
})

export const PRICE_TABLE: Record<number, number> = {
  1: 300,
  2: 500,
  3: 700,
  4: 900,
}

export function calculatePrice(hours: number): number {
  if (hours >= 4) return PRICE_TABLE[4]
  return PRICE_TABLE[hours] || 300
}

export function calculateDeposit(totalPrice: number): number {
  return Math.round(totalPrice * 0.3)
}
