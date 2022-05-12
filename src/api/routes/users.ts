import { Router, Request, Response, NextFunction } from 'express'
import { Container } from 'typedi'
import { UserService, AuthService, RoleService, hashPassword } from '@/services'
import { QueryOptionsBuilder } from '@/api/utils'
import {
  MediumResource,
  OrderResource,
  PaymentResource,
  ReviewResource,
  RoleResource,
  UserResource,
} from '@/api/resources'
import { ResourceIdDTO, UserDTO } from '@/api/dtos'
import { transformAndValidate } from 'class-transformer-validator'
import { isAuth } from '@/api/middlewares/auth'
import { ACLService } from '@/services'
import { getPaginationLinks } from '@/api/utils'

const router = Router()

router.get(
  '/users',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'user')
      )

      const queryParams = {
        page: req.query.page,
        limit: req.query.limit,
        include: req.query.include,
        sort: req.query.sort,
        fields: req.query.fields,
        filter: req.query.filter,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('User')
      const options = queryOptionsBuilder.build(queryParams)

      const userService = Container.get(UserService)
      const { instances: users, count } = await userService.findAndCountAll(
        options
      )

      const paginationLinks = getPaginationLinks(req, count)

      const userResource = Container.of(req.requestId).get(UserResource)
      const asResources = userResource.toArrayOfResources(users)

      return res.status(200).json({ meta: paginationLinks, data: asResources })
    } catch (e) {
      return next(e)
    }
  }
)

router.get(
  '/users/whoami',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryParams = {
        include: req.query.include,
        fields: req.query.fields,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('User')
      const options = queryOptionsBuilder.build(queryParams)

      const userService = Container.get(UserService)
      const user = await userService.findByPK(req.user.id, options)

      const userResource = Container.of(req.requestId).get(UserResource)
      const asResource = userResource.toResource(user)

      return res.status(200).json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/users/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('read', { id: resourceId.id, __subjectType: 'user' }) ||
          ability.can('readAll', 'user')
      )

      const queryParams = {
        include: req.query.include,
        fields: req.query.fields,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('User')
      const options = queryOptionsBuilder.build(queryParams)

      const userService = Container.get(UserService)
      const user = await userService.findByPK(resourceId.id, options)

      const userResource = Container.of(req.requestId).get(UserResource)
      const asResources = userResource.toResource(user)

      return res.status(200).json({ data: asResources })
    } catch (e) {
      next(e)
    }
  }
)

router.post(
  '/users',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )

      const userDTO = (await transformAndValidate(UserDTO, req.body, {
        transformer: {
          excludeExtraneousValues: true,
        },
      })) as UserDTO

      if (userDTO.attributes?.role_id) {
        aclService.authorizeUserOrFail((ability) =>
          ability.can('setAll', 'user_role')
        )
      }

      const userService = Container.get(UserService)
      const createdUser = await userService.create(userDTO)

      const userResource = Container.of(req.requestId).get(UserResource)
      const asResource = userResource.toResource(createdUser)

      return res.status(201).json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.delete(
  '/users/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('delete', { id: resourceId.id, __subjectType: 'user' }) ||
          ability.can('deleteAll', 'user')
      )

      const userService = Container.get(UserService)
      await userService.deleteByPK(resourceId.id)

      return res.status(204).send()
    } catch (e) {
      next(e)
    }
  }
)

router.patch(
  '/users/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('update', { id: resourceId.id, __subjectType: 'user' }) ||
          ability.can('updateAll', 'user')
      )

      const userDTO = (await transformAndValidate(UserDTO, req.body, {
        validator: {
          skipMissingProperties: true,
        },
        transformer: {
          excludeExtraneousValues: true,
        },
      })) as UserDTO

      if (userDTO.attributes?.role_id) {
        aclService.authorizeUserOrFail((ability) =>
          ability.can('setAll', 'user_role')
        )
      }

      // Hash password if exists
      if (userDTO.attributes?.password) {
        userDTO.attributes.password = hashPassword(userDTO.attributes.password)
      }

      const userService = Container.get(UserService)
      const updatedUser = await userService.updateByPK(resourceId.id, userDTO)

      const userResource = Container.of(req.requestId).get(UserResource)
      const asResource = userResource.toResource(updatedUser)

      return res.status(200).json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.post(
  '/users:authenticate',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authService = Container.get(AuthService)
      const { user, token } = await authService.authenticate(req.body)

      const userResource = Container.of(req.requestId).get(UserResource)
      const asResource = userResource.toResource(user)

      res.cookie('master_access_token', token, {
        domain: req.hostname,
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 60 * 24 * 7,
      })

      return res.status(200).json({ data: asResource })
    } catch (e) {
      return next(e)
    }
  }
)

router.get(
  '/users/:id/roles',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'role')
      )

      const queryParams = {
        include: req.query.include,
        fields: req.query.fields,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('Role')
      const options = queryOptionsBuilder.build(queryParams)

      const roleService = Container.get(RoleService)
      const role = await roleService.findByPK(req.user.role_id, options)

      const roleResource = Container.of(req.requestId).get(RoleResource)
      const asResource = roleResource.toResource(role)

      res.status(200).json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/users/:id/reviews',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'review') ||
          ability.can('read', {
            user_id: resourceId.id,
            __subjectType: 'review',
          })
      )

      const queryParams = {
        page: req.query.page,
        limit: req.query.limit,
        include: req.query.include,
        sort: req.query.sort,
        fields: req.query.fields,
        filter: req.query.filter,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('Review')
      const options = queryOptionsBuilder.build(queryParams)

      const userService = Container.get(UserService)
      const { instances: reviews, count } = await userService.findUserReviews(
        resourceId.id,
        options
      )

      const paginationLinks = getPaginationLinks(req, count)

      const reviewResource = Container.of(req.requestId).get(ReviewResource)
      const asResource = reviewResource.toArrayOfResources(reviews)

      res.status(200).json({ meta: paginationLinks, data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/users/:id/orders',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'order') ||
          ability.can('read', {
            user_id: resourceId.id,
            __subjectType: 'order',
          })
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

      const userService = Container.get(UserService)
      const { instances: orders, count } = await userService.findUserOrders(
        resourceId.id,
        options
      )

      const paginationLinks = getPaginationLinks(req, count)

      const orderResource = Container.of(req.requestId).get(OrderResource)
      const asResource = orderResource.toArrayOfResources(orders)

      res.status(200).json({ meta: paginationLinks, data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/users/:id/media',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'medium') ||
          ability.can('read', {
            user_id: resourceId.id,
            __subjectType: 'medium',
          })
      )

      const queryParams = {
        page: req.query.page,
        limit: req.query.limit,
        include: req.query.include,
        sort: req.query.sort,
        fields: req.query.fields,
        filter: req.query.filter,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('Medium')
      const options = queryOptionsBuilder.build(queryParams)

      const userService = Container.get(UserService)
      const { instances: media, count } = await userService.findUserMedia(
        resourceId.id,
        options
      )

      const paginationLinks = getPaginationLinks(req, count)

      const mediaResource = Container.of(req.requestId).get(MediumResource)
      const asResource = mediaResource.toArrayOfResources(media)

      res.status(200).json({ meta: paginationLinks, data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/users/:id/payments',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'payment') ||
          ability.can('read', {
            user_id: resourceId.id,
            __subjectType: 'payment',
          })
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

      const userService = Container.get(UserService)
      const { instances: payments, count } = await userService.findUserPayments(
        resourceId.id,
        options
      )

      const paginationLinks = getPaginationLinks(req, count)

      const paymentResource = Container.of(req.requestId).get(PaymentResource)
      const asResource = paymentResource.toArrayOfResources(payments)

      res.status(200).json({ meta: paginationLinks, data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

export default router
