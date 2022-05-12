import 'reflect-metadata'
import 'dotenv/config'
import express from 'express'
import loaders from '@/lib'
import logger from '@/lib/winston'
import config from '@/config'

async function startServer(): Promise<void> {
  const app = express()

  await loaders(app)

  app.listen(config.app.port, () => {
    logger.info('Server started on port ' + config.app.port)
  })
}

startServer()
