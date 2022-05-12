import { Router, Request, Response, NextFunction } from 'express'
import { Container } from 'typedi'
import { ACLService, PaymentService } from '@/services'
import { OrderResource, PaymentResource, UserResource } from '@/api/resources'
import { isAuth } from '@/api/middlewares/auth'
import { QueryOptionsBuilder } from '@/api/utils'
import { transformAndValidate } from 'class-transformer-validator'
import { ResourceIdDTO } from '@/api/dtos'
import { getPaginationLinks } from '@/api/utils'

const router = Router()

router.get(
  '/payments',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'payment')
      )

      const queryParams = {
        page: req.query.page,
        limit: req.query.limit,
        include: req.query.include,
        sort: req.query.sort,
        fields: req.query.fields,
        filter: req.query.filter,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('Payment')
      const options = queryOptionsBuilder.build(queryParams)

      const paymentService = Container.get(PaymentService)
      const { instances: payments, count } =
        await paymentService.findAndCountAll(options)

      const paginationLinks = getPaginationLinks(req, count)

      const paymentsResource = Container.of(req.requestId).get(PaymentResource)
      const asResources = paymentsResource.toArrayOfResources(payments)

      return res.json({ meta: paginationLinks, data: asResources })
    } catch (e) {
      return next(e)
    }
  }
)

router.get(
  '/payments/:id',
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

      const queryOptionsBuilder = new QueryOptionsBuilder('Payment')
      const options = queryOptionsBuilder.build(queryParams)

      const paymentService = Container.get(PaymentService)
      const payment = await paymentService.findByPK(resourceId.id, options)

      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'payment') ||
          ability.can('read', {
            user_id: payment.getDataValue('user_id').toString(),
          })
      )

      const paymentResource = Container.of(req.requestId).get(PaymentResource)

      const asResources = paymentResource.toResource(payment)

      return res.json({ data: asResources })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/payments/:id/users',
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

      const paymentService = Container.get(PaymentService)
      const user = await paymentService.findPaymentOwner(resourceId.id, options)

      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'user') ||
          ability.can('read', {
            id: user.getDataValue('id').toString(),
            __subjectType: 'user',
          })
      )

      const userResource = Container.of(req.requestId).get(UserResource)
      const asResource = userResource.toResource(user)

      res.status(200).json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/payments/:id/orders',
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

      const paymentService = Container.get(PaymentService)
      const order = await paymentService.findPaymentOrder(
        resourceId.id,
        options
      )

      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'order') ||
          ability.can('read', {
            user_id: order.getDataValue('user_id').toString(),
            __subjectType: 'order',
          })
      )

      const orderResource = Container.of(req.requestId).get(OrderResource)
      const asResource = orderResource.toResource(order)

      res.status(200).json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

export default router
