import assert from 'assert'

assert(process.env.STRIPE_PUBLIC_KEY, 'STRIPE_PUBLISHABLE_KEY is required')
assert(process.env.STRIPE_SECRET_KEY, 'STRIPE_SECRET_KEY is required')
assert(
  process.env.STRIPE_WEBHOOK_SECRET_KEY,
  'STRIPE_WEBHOOK_SECRET_KEY is required'
)

export default {
  publicKey: process.env.STRIPE_PUBLIC_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecretKey: process.env.STRIPE_WEBHOOK_SECRET_KEY,
}
