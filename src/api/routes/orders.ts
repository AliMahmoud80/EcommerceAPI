import { Router, Request, Response, NextFunction } from 'express'
import { Container } from 'typedi'
import { ACLService, OrderService } from '@/services'
import { OrderResource, ProductResource, UserResource } from '@/api/resources'
import { OrderDTO, ResourceIdDTO } from '@/api/dtos'
import { transformAndValidate } from 'class-transformer-validator'
import { isAuth } from '@/api/middlewares/auth'
import { QueryOptionsBuilder, getPaginationLinks } from '@/api/utils'

const router = Router()

router.get(
  '/orders',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'order')
      )

      const queryParams = {
        page: req.query.page,
        limit: req.query.limit,
        include: req.query.include,
        sort: req.query.sort,
        fields: req.query.fields,
        filter: req.query.filter,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('Order')
      const options = queryOptionsBuilder.build(queryParams)

      const orderService = Container.get(OrderService)
      const { instances: orders, count } = await orderService.findAndCountAll(
        options
      )

      const paginationLinks = getPaginationLinks(req, count)

      const orderResource = Container.of(req.requestId).get(OrderResource)
      const asResources = orderResource.toArrayOfResources(orders)

      res.json({ meta: paginationLinks, data: asResources })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/orders/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )

      const queryParams = {
        include: req.query.include,
        fields: req.query.fields,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('Order')
      const options = queryOptionsBuilder.build(queryParams)

      const orderService = Container.get(OrderService)
      const order = await orderService.findByPK(resourceId.id, options)

      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('read', {
            user_id: order.getDataValue('user_id'),
            __subjectType: 'order',
          }) || ability.can('readAll', 'order')
      )

      const prodcutResource = Container.of(req.requestId).get(OrderResource)
      const asResources = prodcutResource.toResource(order)

      return res.json({ data: asResources })
    } catch (e) {
      next(e)
    }
  }
)

router.post(
  '/orders',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('create', 'order')
      )

      const orderDTO = (await transformAndValidate(OrderDTO, req.body, {
        transformer: {
          excludeExtraneousValues: true,
        },
      })) as OrderDTO

      const orderService = Container.get(OrderService)
      const createdOrder = await orderService.create(orderDTO, req.user.id)

      const prodcutResource = Container.of(req.requestId).get(OrderResource)
      const asResource = prodcutResource.toResource(createdOrder)

      return res.json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.post(
  '/orders/:id[(\\:)]checkout',
  // [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )

      const orderService = Container.get(OrderService)
      const order = await orderService.findByPK(resourceId.id)

      // aclService.authorizeUserOrFail((ability) =>
      //   ability.can('update', {
      //     user_id: order.getDataValue('user_id').toString(),
      //     __subjectType: 'order',
      //   })
      // )

      const paymentIntent = await orderService.createOrderPaymentIntent(order)

      res.status(200).json({ clientSecret: paymentIntent.client_secret })
    } catch (e) {
      next(e)
    }
  }
)

router.post(
  '/orders/:id[(\\:)]cancel',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )

      const orderService = Container.get(OrderService)
      const order = await orderService.findByPK(resourceId.id)

      aclService.authorizeUserOrFail((ability) =>
        ability.can('update', {
          user_id: order.getDataValue('user_id').toString(),
          __subjectType: 'order',
        })
      )

      await orderService.cancelOrder(order)

      res.status(202).send()
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/orders/:id/users',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )

      const queryParams = {
        include: req.query.include,
        fields: req.query.fields,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('User')
      const options = queryOptionsBuilder.build(queryParams)

      const orderService = Container.get(OrderService)
      const order = await orderService.findByPK(resourceId.id)

      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'user') ||
          ability.can('read', {
            id: order.getDataValue('user_id'),
            __subjectType: 'user',
          })
      )

      const user = await order.getUser(options)

      const userResource = Container.of(req.requestId).get(UserResource)
      const asResource = userResource.toResource(user)

      res.status(200).json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/orders/:id/products',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'product')
      )

      const queryParams = {
        page: req.query.page,
        limit: req.query.limit,
        include: req.query.include,
        sort: req.query.sort,
        fields: req.query.fields,
        filter: req.query.filter,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('Product')
      const options = queryOptionsBuilder.build(queryParams)

      const orderService = Container.get(OrderService)
      const { instances: products, count } =
        await orderService.findOrderProducts(resourceId.id, options)

      const paginationLinks = getPaginationLinks(req, count)

      const productResources = Container.of(req.requestId).get(ProductResource)
      const asResources = productResources.toArrayOfResources(products)

      res.status(200).json({ meta: paginationLinks, data: asResources })
    } catch (e) {
      next(e)
    }
  }
)

export default router
