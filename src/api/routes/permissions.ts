import { Router, Request, Response, NextFunction } from 'express'
import { Container } from 'typedi'
import { ACLService, PermissionService } from '@/services'
import { PermissionResource } from '@/api/resources'
import { isAuth } from '@/api/middlewares/auth'
import { QueryOptionsBuilder } from '@/api/utils'
import { transformAndValidate } from 'class-transformer-validator'
import { ResourceIdDTO } from '@/api/dtos'
import { getPaginationLinks } from '@/api/utils'

const router = Router()

router.get(
  '/permissions',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'permission')
      )

      const queryParams = {
        page: req.query.page,
        limit: req.query.limit,
        include: req.query.include,
        sort: req.query.sort,
        fields: req.query.fields,
        filter: req.query.filter,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('Permission')
      const options = queryOptionsBuilder.build(queryParams)

      const permissionService = Container.get(PermissionService)
      const { instances: permissions, count } =
        await permissionService.findAndCountAll(options)

      const paginationLinks = getPaginationLinks(req, count)

      const permissionResource = Container.of(req.requestId).get(
        PermissionResource
      )
      const asResources = permissionResource.toArrayOfResources(permissions)

      return res.json({ meta: paginationLinks, data: asResources })
    } catch (e) {
      return next(e)
    }
  }
)

router.get(
  '/permissions/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'permission')
      )

      const queryParams = {
        include: req.query.include,
        fields: req.query.fields,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('Permission')
      const options = queryOptionsBuilder.build(queryParams)

      const permissionService = Container.get(PermissionService)
      const permission = await permissionService.findByPK(
        resourceId.id,
        options
      )

      const permissionResource = Container.of(req.requestId).get(
        PermissionResource
      )
      const asResources = permissionResource.toResource(permission)

      return res.json({ data: asResources })
    } catch (e) {
      next(e)
    }
  }
)

export default router
