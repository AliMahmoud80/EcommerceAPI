import { Router, Request, Response, NextFunction } from 'express'
import { Container } from 'typedi'
import { ACLService, RoleService } from '@/services'
import { PermissionResource, RoleResource, UserResource } from '@/api/resources'
import { transformAndValidate } from 'class-transformer-validator'
import { isAuth } from '@/api/middlewares/auth'
import { RoleDTO, ResourceIdDTO } from '@/api/dtos'
import { QueryOptionsBuilder, getPaginationLinks } from '@/api/utils'

const router = Router()

router.get(
  '/roles',
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

      const queryOptionsBuilder = new QueryOptionsBuilder('Role')
      const options = queryOptionsBuilder.build(queryParams)

      const roleService = Container.get(RoleService)
      const { instances: roles, count } = await roleService.findAndCountAll(
        options
      )

      const paginationLinks = getPaginationLinks(req, count)

      const roleResource = Container.of(req.requestId).get(RoleResource)
      const asResources = roleResource.toArrayOfResources(roles)

      return res.status(200).json({ meta: paginationLinks, data: asResources })
    } catch (e) {
      return next(e)
    }
  }
)

router.get(
  '/roles/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('read', { id: resourceId.id, __subjectType: 'role' }) ||
          ability.can('readAll', 'role')
      )

      const queryParams = {
        include: req.query.include,
        fields: req.query.fields,
      }

      const queryOptionsBuilder = new QueryOptionsBuilder('Role')
      const options = queryOptionsBuilder.build(queryParams)

      const roleService = Container.get(RoleService)
      const roles = await roleService.findByPK(resourceId.id, options)

      const roleResource = Container.of(req.requestId).get(RoleResource)
      const asResources = roleResource.toResource(roles)

      return res.status(200).json({ data: asResources })
    } catch (e) {
      next(e)
    }
  }
)

router.post(
  '/roles',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail((ability) => ability.can('create', 'role'))

      const roleDTO = (await transformAndValidate(RoleDTO, req.body, {
        validator: {
          skipUndefinedProperties: true,
        },
        transformer: {
          excludeExtraneousValues: true,
        },
      })) as RoleDTO

      const roleService = Container.get(RoleService)
      const roles = await roleService.create(roleDTO)

      const roleResource = Container.of(req.requestId).get(RoleResource)
      const asResources = roleResource.toResource(roles)

      return res.status(200).json({ data: asResources })
    } catch (e) {
      next(e)
    }
  }
)

router.delete(
  '/roles/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('delete', { id: resourceId.id, __subjectType: 'role' }) ||
          ability.can('deleteAll', 'role')
      )

      const roleService = Container.get(RoleService)
      await roleService.deleteByPK(resourceId.id)

      return res.status(202).json()
    } catch (e) {
      return next(e)
    }
  }
)

router.patch(
  '/roles/:id',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('update', { id: resourceId.id, __subjectType: 'role' }) ||
          ability.can('updateAll', 'role')
      )

      const roleDTO = (await transformAndValidate(RoleDTO, req.body, {
        validator: {
          skipMissingProperties: true,
        },
        transformer: {
          excludeExtraneousValues: true,
        },
      })) as RoleDTO

      const roleService = Container.get(RoleService)
      const role = await roleService.updateByPK(resourceId.id, roleDTO)

      const roleResource = Container.of(req.requestId).get(RoleResource)
      const asResource = roleResource.toResource(role)

      res.status(200).json({ data: asResource })
    } catch (e) {
      return next(e)
    }
  }
)

router.get(
  '/roles/:id/users',
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
          ability.can('read', {
            id: resourceId.id,
            __subjectType: 'user',
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

      const queryOptionsBuilder = new QueryOptionsBuilder('User')
      const options = queryOptionsBuilder.build(queryParams)

      const roleService = Container.get(RoleService)
      const { instances: users, count } = await roleService.findRoleUsers(
        resourceId.id,
        options
      )

      const paginationLinks = getPaginationLinks(req, count)

      const userResources = Container.of(req.requestId).get(UserResource)
      const asResources = userResources.toArrayOfResources(users)

      res.status(200).json({ meta: paginationLinks, data: asResources })
    } catch (e) {
      next(e)
    }
  }
)

router.get(
  '/roles/:id/permissions',
  [isAuth],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = await transformAndValidate(ResourceIdDTO, req.params)

      const aclService = Container.of(req.requestId).get<ACLService>(
        'ACLService'
      )
      aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'permission') ||
          ability.can('read', {
            id: resourceId.id,
            __subjectType: 'permission',
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

      const queryOptionsBuilder = new QueryOptionsBuilder('Permission')
      const options = queryOptionsBuilder.build(queryParams)

      const roleService = Container.get(RoleService)
      const { instances: permissions, count } =
        await roleService.findRolePermissions(resourceId.id, options)

      const paginationLinks = getPaginationLinks(req, count)

      const permissionResources = Container.of(req.requestId).get(
        PermissionResource
      )
      const asResources = permissionResources.toArrayOfResources(permissions)

      res.status(200).json({ meta: paginationLinks, data: asResources })
    } catch (e) {
      next(e)
    }
  }
)

export default router
