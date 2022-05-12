import { Router, Request, Response, NextFunction } from 'express'
import { Container } from 'typedi'
import { ACLService, ReviewService } from '@/services'
import { ProductResource, ReviewResource, UserResource } from '@/api/resources'
import { ReviewDTO, ResourceIdDTO } from '@/api/dtos'
import { transformAndValidate } from 'class-transformer-validator'
import { isAuth } from '@/api/middlewares/auth'
import { QueryOptionsBuilder, getPaginationLinks } from '@/api/utils'
import { ValidationError } from '../errors'

const router = Router()

router.get(
  '/reviews',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
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

      const reviewService = Container.get(ReviewService)
      const { instances: reviews, count } = await reviewService.findAndCountAll(
        options
      )

      const paginationLinks = getPaginationLinks(req, count)

      const reviewResource = Container.of(req.requestId).get(ReviewResource)
      const asResources = reviewResource.toArrayOfResources(reviews)

      return res.json({ meta: paginationLinks, data: asResources })
    } catch (e) {
      return next(e)
    }
  }
)

router.get(
  '/reviews/:id',
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

      const queryOptionsBuilder = new QueryOptionsBuilder('Permission')
      const options = queryOptionsBuilder.build(queryParams)

      const reviewService = Container.get(ReviewService)
      const review = await reviewService.findByPK(resourceId.id, options)

      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'review') ||
          ability.can('read', {
            user_id: review.getDataValue('user_id'),
            __subjectType: 'review',
          })
      )

      const reviewResource = Container.of(req.requestId).get(ReviewResource)
      const asResources = reviewResource.toResource(review)

      return res.json({ data: asResources })
    } catch (e) {
      next(e)
    }
  }
)

router.post(
  '/reviews',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('create', 'review')
      )

      const reviewDTO = (await transformAndValidate(ReviewDTO, req.body, {
        transformer: {
          excludeExtraneousValues: true,
        },
      })) as ReviewDTO

      const reviewService = Container.get(ReviewService)
      const createdReview = await reviewService.create(reviewDTO, req.user.id)

      const prodcutResource = Container.of(req.requestId).get(ReviewResource)
      const asResource = prodcutResource.toResource(createdReview)

      return res.json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.delete(
  '/reviews/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )

      const reviewService = Container.get(ReviewService)
      const review = await reviewService.findByPK(resourceId.id)

      aclService.authorizeUserOrFail((ability) =>
        ability.can('delete', {
          user_id: review.getDataValue('user_id'),
          __subjectType: 'review',
        })
      )

      await review.destroy()

      return res.status(202).json()
    } catch (e) {
      return next(e)
    }
  }
)

router.patch(
  '/reviews/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )

      const reviewDTO = (await transformAndValidate(ReviewDTO, req.body, {
        validator: {
          skipMissingProperties: true,
        },
        transformer: {
          excludeExtraneousValues: true,
        },
      })) as ReviewDTO

      if (reviewDTO.attributes.product_id)
        throw new ValidationError({
          detail: "You can't change reviewed product",
        })

      const reviewService = Container.get(ReviewService)
      const review = await reviewService.findByPK(resourceId.id)

      aclService.authorizeUserOrFail((ability) =>
        ability.can('update', {
          user_id: review.getDataValue('user_id'),
          __subjectType: 'review',
        })
      )

      const updatedReview = await reviewService.updateByPK(
        resourceId.id,
        reviewDTO
      )

      const prodcutResource = Container.of(req.requestId).get(ReviewResource)
      const asResource = prodcutResource.toResource(updatedReview)

      res.status(200).json({ data: asResource })
    } catch (e) {
      return next(e)
    }
  }
)

router.get(
  '/reviews/:id/users',
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

      const reviewService = Container.get(ReviewService)
      const user = await reviewService.findReviewOwner(resourceId.id, options)

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
  '/reviews/:id/products',
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

      const queryOptionsBuilder = new QueryOptionsBuilder('Product')
      const options = queryOptionsBuilder.build(queryParams)

      const reviewService = Container.get(ReviewService)
      const product = await reviewService.findReviewedProduct(
        resourceId.id,
        options
      )

      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'product') ||
          ability.can('read', {
            id: product.getDataValue('id'),
            __subjectType: 'product',
          })
      )

      const productResource = Container.of(req.requestId).get(ProductResource)
      const asResource = productResource.toResource(product)

      res.status(200).json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

export default router
