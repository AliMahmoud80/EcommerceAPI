import express from 'express'
import expressLoader from './express'
import sequelizeLoader from './sequelize'
import logger from './winston'
import dependencyInjector from './dependencyInjector'
import * as allModels from '@/models'

export default async (app: express.Application) => {
  await sequelizeLoader.authenticate()
  logger.info('Database connected')

  dependencyInjector({ sequelizeModels: models })
  logger.info('Models injected')

  expressLoader(app)
  logger.info('Express loaded ')
}

const models = {
  User: allModels.User,
  Supplier: allModels.Supplier,
  Product: allModels.Product,
  Review: allModels.Review,
  Payment: allModels.Payment,
  Category: allModels.Category,
  Medium: allModels.Medium,
  Order: allModels.Order,
  OrderProduct: allModels.OrderProduct,
  Permission: allModels.Permission,
  Role: allModels.Role,
  RolePermission: allModels.RolePermission,
}
