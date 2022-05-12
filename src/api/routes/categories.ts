import { Router, Request, Response, NextFunction } from 'express'
import { Container } from 'typedi'
import { ACLService, CategoryService } from '@/services'
import { CategoryResource, ProductResource } from '@/api/resources'
import { ResourceIdDTO } from '@/api/dtos'
import { transformAndValidate } from 'class-transformer-validator'
import { isAuth } from '@/api/middlewares/auth'
import { CategoryDTO } from '@/api/dtos'
import { QueryOptionsBuilder, getPaginationLinks } from '@/api/utils'

const router = Router()

router.get(
  '/categories',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'category')
      )

      const queryParams = {
        page: req.query.page,
        limit: req.query.limit,
        include: req.query.include,
        sort: req.query.sort,
        fields: req.query.fields,
        filter: req.query.filter,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('Category')
      const options = queryOptionsBuilder.build(queryParams)

      const categoryService = Container.get(CategoryService)
      const { instances: categories, count } =
        await categoryService.findAndCountAll(options)

      const paginationLinks = getPaginationLinks(req, count)

      const categoryResource = Container.of(req.requestId).get(CategoryResource)
      const asResources = categoryResource.toArrayOfResources(categories)

      return res.json({ meta: paginationLinks, data: asResources })
    } catch (e) {
      return next(e)
    }
  }
)

router.get(
  '/categories/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('read', {
            id: resourceId.id,
            __subjectType: 'category',
          }) || ability.can('readAll', 'category')
      )

      const queryParams = {
        include: req.query.include,
        fields: req.query.fields,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('Category')
      const options = queryOptionsBuilder.build(queryParams)

      const categoryService = Container.get(CategoryService)
      const categories = await categoryService.findByPK(resourceId.id, options)

      const categoryResource = Container.of(req.requestId).get(CategoryResource)
      const asResources = categoryResource.toResource(categories)

      return res.json({ data: asResources })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/categories/:id/parent',
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

      const categoryService = Container.get(CategoryService)
      const parent_category = await categoryService.findParentCategoryByPK(
        resourceId.id,
        options
      )

      const categoryResource = Container.of(req.requestId).get(CategoryResource)
      const asResources = categoryResource.toResource(parent_category)

      return res.json({ data: asResources })
    } catch (e) {
      next(e)
    }
  }
)

router.post(
  '/categories',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('create', 'category')
      )

      const categoryDTO = (await transformAndValidate(CategoryDTO, req.body, {
        validator: {
          skipUndefinedProperties: true,
        },
        transformer: {
          excludeExtraneousValues: true,
        },
      })) as CategoryDTO

      const categoryService = Container.get(CategoryService)
      const categories = await categoryService.create(categoryDTO)

      const categoryResource = Container.of(req.requestId).get(CategoryResource)
      const asResources = categoryResource.toResource(categories)

      return res.json({ data: asResources })
    } catch (e) {
      next(e)
    }
  }
)

router.delete(
  '/categories/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const categoryService = Container.get(CategoryService)
      await categoryService.deleteByPK(resourceId.id)

      return res.status(202).json()
    } catch (e) {
      return next(e)
    }
  }
)

router.patch(
  '/categories/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const categoryDTO = (await transformAndValidate(CategoryDTO, req.body, {
        validator: {
          skipMissingProperties: true,
        },
        transformer: {
          excludeExtraneousValues: true,
        },
      })) as CategoryDTO

      const categoryService = Container.get(CategoryService)
      const category = await categoryService.updateByPK(
        resourceId.id,
        categoryDTO
      )

      const categoryResource = Container.of(req.requestId).get(CategoryResource)
      const asResource = categoryResource.toResource(category)

      res.status(200).json({ data: asResource })
    } catch (e) {
      return next(e)
    }
  }
)

router.get(
  '/categories/:id/products',
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

      const categoryService = Container.get(CategoryService)
      const { instances: products, count } =
        await categoryService.findCategoryProducts(resourceId.id, options)

      const paginationLinks = getPaginationLinks(req, count)

      const productResource = Container.of(req.requestId).get(ProductResource)
      const asResource = productResource.toArrayOfResources(products)

      res.status(200).json({ meta: paginationLinks, data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

export default router
