import { Router, Request, Response, NextFunction } from 'express'
import { Container } from 'typedi'
import { ACLService, SupplierService, UserService } from '@/services'
import {
  ProductResource,
  ReviewResource,
  SaleResource,
  SupplierResource,
  UserResource,
} from '@/api/resources'
import { ResourceIdDTO, SupplierDTO } from '@/api/dtos'
import { transformAndValidate } from 'class-transformer-validator'
import { isAuth } from '@/api/middlewares/auth'
import { QueryOptionsBuilder, getPaginationLinks } from '@/api/utils'

const router = Router()

router.get(
  '/suppliers',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'supplier')
      )

      const queryParams = {
        page: req.query.page,
        limit: req.query.limit,
        include: req.query.include,
        sort: req.query.sort,
        fields: req.query.fields,
        filter: req.query.filter,
      }

      const queryOptionsBuidler = new QueryOptionsBuilder('Supplier')
      const options = queryOptionsBuidler.build(queryParams)

      const supplierService = Container.get(SupplierService)
      const { instances: suppliers, count } =
        await supplierService.findAndCountAll(options)

      const paginationLinks = getPaginationLinks(req, count)

      const supplierResource = Container.of(req.requestId).get(SupplierResource)
      const asResources = supplierResource.toArrayOfResources(suppliers)

      return res.json({ meta: paginationLinks, data: asResources })
    } catch (e) {
      return next(e)
    }
  }
)

router.get(
  '/suppliers/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('read', {
            user_id: req.params.id,
            __subjectType: 'supplier',
          }) || ability.can('readAll', 'supplier')
      )

      const queryParams = {
        include: req.query.include,
        fields: req.query.fields,
      }

      const queryOptionsBuidler = new QueryOptionsBuilder('Supplier')
      const options = queryOptionsBuidler.build(queryParams)

      const supplierService = Container.get(SupplierService)
      const supplier = await supplierService.findByPK(resourceId.id, options)

      const supplierResource = Container.of(req.requestId).get(SupplierResource)
      const asResources = supplierResource.toResource(supplier)

      return res.json({ data: asResources })
    } catch (e) {
      next(e)
    }
  }
)

router.post(
  '/suppliers',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const supplierDTO = (await transformAndValidate(SupplierDTO, req.body, {
        transformer: {
          excludeExtraneousValues: true,
        },
      })) as SupplierDTO

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('create', 'supplier')
      )

      const supplierService = Container.get(SupplierService)
      const createdSupplier = await supplierService.create(
        req.user.id,
        supplierDTO
      )

      const supplierResource = Container.of(req.requestId).get(SupplierResource)
      const asResource = supplierResource.toResource(createdSupplier)

      return res.json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.delete(
  '/suppliers/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('delete', {
          user_id: req.params.id,
          __subjectType: 'supplier',
        })
      )

      const supplierService = Container.get(SupplierService)
      await supplierService.deleteByPK(resourceId.id, 'user_id')

      return res.status(204).send()
    } catch (e) {
      next(e)
    }
  }
)

router.patch(
  '/suppliers/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('update', {
          user_id: req.params.id,
          __subjectType: 'supplier',
        })
      )

      const supplierDTO = (await transformAndValidate(SupplierDTO, req.body, {
        validator: {
          skipMissingProperties: true,
        },
        transformer: {
          excludeExtraneousValues: true,
        },
      })) as SupplierDTO

      const supplierService = Container.get(SupplierService)
      const updatedSupplier = await supplierService.updateByPK(
        resourceId.id,
        supplierDTO
      )

      const supplierResource = Container.of(req.requestId).get(SupplierResource)
      const asResource = supplierResource.toResource(updatedSupplier)

      return res.json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/suppliers/:id/users',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'user') ||
          ability.can('read', { id: req.params.id, __subjectType: 'user' })
      )

      const queryParams = {
        include: req.query.include,
        fields: req.query.fields,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('User')
      const options = queryOptionsBuilder.build(queryParams)

      // Making sure supplier exists
      const supplierService = Container.get(SupplierService)
      await supplierService.findByPK(resourceId.id, options)

      const userService = Container.get(UserService)
      const user = await userService.findByPK(resourceId.id, options)

      const userResource = Container.of(req.requestId).get(UserResource)
      const asResource = userResource.toResource(user)

      res.status(200).json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/suppliers/:id/products',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'product') ||
          ability.can('read', {
            supplier_id: resourceId.id,
            __subjectType: 'product',
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

      const queryOptionsBuilder = new QueryOptionsBuilder('Product')
      const options = queryOptionsBuilder.build(queryParams)

      const supplierService = Container.get(SupplierService)
      const { instances: products, count } =
        await supplierService.findSupplierProducts(resourceId.id, options)

      const paginationLinks = getPaginationLinks(req, count)

      const productResource = Container.of(req.requestId).get(ProductResource)
      const asResource = productResource.toArrayOfResources(products)

      res.status(200).json({ meta: paginationLinks, data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/suppliers/:id/reviews',
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
            user_id: req.user.id,
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

      const supplierService = Container.get(SupplierService)
      const { instances: reviews, count } =
        await supplierService.findSupplierReviews(resourceId.id, options)

      const paginationLinks = getPaginationLinks(req, count)

      const recviewResource = Container.of(req.requestId).get(ReviewResource)
      const asResource = recviewResource.toArrayOfResources(reviews)

      res.status(200).json({ meta: paginationLinks, data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/suppliers/:id/sales',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'sale') ||
          ability.can('read', {
            supplier_id: resourceId.id,
            __subjectType: 'sale',
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

      const queryOptionsBuilder = new QueryOptionsBuilder('Sale')
      const options = queryOptionsBuilder.build(queryParams)

      const supplierService = Container.get(SupplierService)
      const { instances: sales, count } =
        await supplierService.findSupplierSales(resourceId.id, options)

      const paginationLinks = getPaginationLinks(req, count)

      const saleResource = Container.of(req.requestId).get(SaleResource)
      const asResource = saleResource.toArrayOfResources(sales)

      res.status(200).json({ meta: paginationLinks, data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

export default router
