import { Router, Request, Response, NextFunction } from 'express'
import { Container } from 'typedi'
import { ACLService, ProductService } from '@/services'
import {
  CategoryResource,
  ProductResource,
  ReviewResource,
  SupplierResource,
} from '@/api/resources'
import { ProductDTO, ResourceIdDTO } from '@/api/dtos'
import { transformAndValidate } from 'class-transformer-validator'
import { isAuth } from '@/api/middlewares/auth'
import { QueryOptionsBuilder, getPaginationLinks } from '@/api/utils'

const router = Router()

router.get(
  '/products',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
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

      const productService = Container.get(ProductService)
      const { instances: products, count } =
        await productService.findAndCountAll(options)

      const paginationLinks = getPaginationLinks(req, count)

      const productResource = Container.of(req.requestId).get(ProductResource)
      const asResources = productResource.toArrayOfResources(products)

      return res.json({ meta: paginationLinks, data: asResources })
    } catch (e) {
      return next(e)
    }
  }
)

router.get(
  '/products/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'product') ||
          ability.can('read', { id: resourceId.id, __subjectType: 'product' })
      )

      const queryParams = {
        include: req.query.include,
        fields: req.query.fields,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('Product')
      const options = queryOptionsBuilder.build(queryParams)

      const productService = Container.get(ProductService)
      const products = await productService.findByPK(resourceId.id, options)

      const prodcutResource = Container.of(req.requestId).get(ProductResource)
      const asResources = prodcutResource.toResource(products)

      return res.json({ data: asResources })
    } catch (e) {
      next(e)
    }
  }
)

router.post(
  '/products',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('create', 'product')
      )

      const productDTO = (await transformAndValidate(ProductDTO, req.body, {
        transformer: {
          excludeExtraneousValues: true,
        },
      })) as ProductDTO

      const productService = Container.get(ProductService)
      const createdProduct = await productService.create(
        productDTO,
        req.user.id
      )

      const prodcutResource = Container.of(req.requestId).get(ProductResource)
      const asResource = prodcutResource.toResource(createdProduct)

      return res.json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.delete(
  '/products/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )

      const productService = Container.get(ProductService)

      const product = await productService.findByPK(resourceId.id)

      aclService.authorizeUserOrFail((ability) =>
        ability.can('delete', {
          supplier_id: product.getDataValue('supplier_id').toString(),
          __subjectType: 'product',
        })
      )

      await product.destroy()

      return res.status(202).json()
    } catch (e) {
      return next(e)
    }
  }
)

router.patch(
  '/products/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )

      const productService = Container.get(ProductService)
      const product = await productService.findByPK(resourceId.id, {
        attributes: ['id', 'supplier_id'],
      })

      aclService.authorizeUserOrFail((ability) =>
        ability.can('update', {
          supplier_id: product.getDataValue('supplier_id').toString(),
          __subjectType: 'product',
        })
      )

      const productDTO = (await transformAndValidate(ProductDTO, req.body, {
        validator: {
          skipMissingProperties: true,
        },
        transformer: {
          excludeExtraneousValues: true,
        },
      })) as ProductDTO

      const updatedProduct = await productService.updateByPK(
        resourceId.id,
        productDTO
      )

      const prodcutResource = Container.of(req.requestId).get(ProductResource)
      const asResource = prodcutResource.toResource(updatedProduct)

      res.status(200).json({ data: asResource })
    } catch (e) {
      return next(e)
    }
  }
)

router.get(
  '/products/:id/suppliers',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'supplier')
      )

      const queryParams = {
        include: req.query.include,
        fields: req.query.fields,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('Supplier')
      const options = queryOptionsBuilder.build(queryParams)

      const productService = Container.get(ProductService)
      const supplier = await productService.findProductSupplier(
        resourceId.id,
        options
      )

      const supplierResource = Container.of(req.requestId).get(SupplierResource)
      const asResource = supplierResource.toResource(supplier)

      res.status(200).json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/products/:id/categories',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'category')
      )

      const queryParams = {
        include: req.query.include,
        fields: req.query.fields,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('Category')
      const options = queryOptionsBuilder.build(queryParams)

      const productService = Container.get(ProductService)
      const category = await productService.findProductCategory(
        resourceId.id,
        options
      )

      const categoryResource = Container.of(req.requestId).get(CategoryResource)
      const asResource = categoryResource.toResource(category)

      return res.status(200).json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/products/:id/reviews',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'review')
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

      const productService = Container.get(ProductService)
      const { instances: reviews, count } =
        await productService.findProductReviews(resourceId.id, options)

      const paginationLinks = getPaginationLinks(req, count)

      const reviewResource = Container.of(req.requestId).get(ReviewResource)
      const asResource = reviewResource.toArrayOfResources(reviews)

      res.status(200).json({ meta: paginationLinks, data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

export default router
