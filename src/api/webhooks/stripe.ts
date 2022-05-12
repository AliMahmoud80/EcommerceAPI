import { Router, Request, Response } from 'express'
import { PaymentService } from '@/services'
import { Container } from 'typedi'
import config from '@/config'
import Stripe from 'stripe'
import stripe from '@/lib/stripe'

const router = Router()

router.post('/webhooks/stripe', async (req: Request, res: Response) => {
  try {
    const paymentService = Container.get(PaymentService)

    const sig: any = req.headers['stripe-signature']

    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      config.stripe.webhookSecretKey
    )

    switch (event.type) {
      case 'payment_intent.succeeded':
        await paymentService.handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        )
        break
    }

    res.send()
  } catch (e) {
    res.status(400).send()
  }
})

export default router
