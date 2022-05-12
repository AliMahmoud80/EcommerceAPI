import express from 'express'
import stripeWebhookRouter from './stripe'

/**
 * Register all webhooks to the express app.
 *
 * @param {express.Application} app - express application to register routes on
 */
export default (app: express.Application): void => {
  app.use(stripeWebhookRouter)
}
