import express from 'express'
import userRouter from './users'
import permissionRouter from './permissions'
import roleRouter from './roles'
import productRouter from './products'
import supplierRouter from './suppliers'
import categoryRouter from './categories'
import reviewRouter from './reviews'
import mediaRouter from './media'
import storageRouter from './storage'
import orderRouter from './orders'
import paymentRouter from './payments'

/**
 * Register all routes to the express app.
 *
 * @param {express.Application} app - express application to register routes on
 */
export default (app: express.Application): void => {
  app.use(userRouter)
  app.use(permissionRouter)
  app.use(roleRouter)
  app.use(supplierRouter)
  app.use(productRouter)
  app.use(categoryRouter)
  app.use(reviewRouter)
  app.use(mediaRouter)
  app.use(storageRouter)
  app.use(orderRouter)
  app.use(paymentRouter)
}
