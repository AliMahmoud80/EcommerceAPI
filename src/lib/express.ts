import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import registerRoutes from '@/api/routes'
import registerWebhooks from '@/api/webhooks'
import InitRequest from '@/api/middlewares/initRequest'
import postRequest from '@/api/middlewares/postRequest'
import { NotFoundHandler, ErrorHandler } from '@/api/middlewares/errorHandlers'
import { authenticate } from '@/api/middlewares/auth'

export default (app: express.Application) => {
  app.use(cors())
  app.use(helmet())
  app.use(cookieParser())

  app.use(
    express.json({
      verify(req: any, _res, buf: Buffer, encoding: BufferEncoding) {
        // Perserve raw body for webhooks as it will be used for validation by stripe
        if (req.url && req.url.includes('/webhooks'))
          req.rawBody = buf.toString(encoding)
      },
    })
  )
  app.use(express.urlencoded({ extended: true }))

  app.use(authenticate)
  app.use(InitRequest)

  // Register application routes
  registerRoutes(app)
  registerWebhooks(app)

  app.use(postRequest)

  // Error handlers
  app.use(NotFoundHandler)
  app.use(ErrorHandler)
}
