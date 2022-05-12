import { NextFunction, Request, Response, Router } from 'express'
import { ACLService, UserService } from '@/services'
import { MediumService } from '@/services/MediumService'
import { transformAndValidate } from 'class-transformer-validator'
import { ResourceIdDTO } from '@/api/dtos'
import { MediumResource, UserResource } from '@/api/resources'
import { QueryOptionsBuilder, getPaginationLinks } from '@/api/utils'
import { isAuth } from '@/api/middlewares/auth'
import Container from 'typedi'
import multer from 'multer'

const router = Router()

const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 10000000 },
})

router.get(
  '/media',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'medium')
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

      const mediaService = Container.get(MediumService)
      const { instances: media, count } = await mediaService.findAndCountAll(
        options
      )

      const paginationLinks = getPaginationLinks(req, count)

      const mediaResource = Container.of(req.requestId).get(MediumResource)
      const asResources = mediaResource.toArrayOfResources(media)

      return res.json({ meta: paginationLinks, data: asResources })
    } catch (e) {
      return next(e)
    }
  }
)

router.post(
  '/media',
  [isAuth],
  upload.single('media'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )

      const mediaService = Container.get(MediumService)
      mediaService.validateFile(req.file)

      aclService.authorizeUserOrFail((ability) =>
        ability.can('create', 'medium')
      )

      const createdMedium = await mediaService.create(req.user.id, req.file)

      const mediaResource = Container.of(req.requestId).get(MediumResource)
      const asResource = mediaResource.toResource(createdMedium)

      res.status(200).json({ data: asResource })
    } catch (err) {
      next(err)
    }
  }
)

router.get(
  '/media/:id',
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

      const queryOptionsBuilder = new QueryOptionsBuilder('Medium')
      const options = queryOptionsBuilder.build(queryParams)

      const mediaService = Container.get(MediumService)
      const medium = await mediaService.findByPK(resourceId.id, options)

      aclService.authorizeUserOrFail((ability) =>
        ability.can('read', {
          user_id: medium.getDataValue('user_id'),
          __subjectType: 'medium',
        })
      )

      const mediaResource = Container.of(req.requestId).get(MediumResource)
      const asResource = mediaResource.toResource(medium)

      res.json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

router.delete(
  '/media/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )

      const mediaService = Container.get(MediumService)
      const medium = await mediaService.findByPK(resourceId.id)

      aclService.authorizeUserOrFail((ability) =>
        ability.can('delete', {
          user_id: medium.getDataValue('user_id'),
          __subjectType: 'medium',
        })
      )

      await mediaService.deleteMedium(medium)

      res.status(202).json()
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/media/:id/users',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'user')
      )

      const queryParams = {
        include: req.query.include,
        fields: req.query.fields,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('User')
      const options = queryOptionsBuilder.build(queryParams)

      const mediaService = Container.get(MediumService)
      const medium = await mediaService.findByPK(resourceId.id, {
        attributes: ['user_id'],
      })

      const userService = Container.get(UserService)
      const user = await userService.findByPK(
        medium.getDataValue('user_id').toString(),
        options
      )

      const userResource = Container.of(req.requestId).get(UserResource)
      const asResource = userResource.toResource(user)

      res.status(200).json({ data: asResource })
    } catch (e) {
      next(e)
    }
  }
)

export default router
