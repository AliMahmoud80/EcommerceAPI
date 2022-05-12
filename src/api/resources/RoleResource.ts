import { JsonResource } from '@/api/resources'
import { IRoleResource } from '@/interfaces'
import { Role } from '@/models'
import { Inject, Service } from 'typedi'
import UserResource from './/UserResource'
import PermissionResource from './PermissionResource'
import config from '@/config'

@Service()
export class RoleResource extends JsonResource<Role, IRoleResource> {
  @Inject(() => UserResource)
  private userResource: UserResource

  constructor(private permissionResource: PermissionResource) {
    super()
  }

  toResource(model: Role): IRoleResource {
    const resource: IRoleResource = {
      id: model.getDataValue('id')?.toString(),
      type: 'Role',
      attributes: {
        name: model.getDataValue('name'),
        created_at: model.getDataValue('created_at'),
        updated_at: model.getDataValue('updated_at'),
      },
      relationships: {
        permissions: {
          links: {
            self:
              config.app.url +
              '/roles/' +
              model.getDataValue('id') +
              '/permissions',
          },
        },
        users: {
          links: {
            self:
              config.app.url + '/roles/' + model.getDataValue('id') + '/users',
          },
        },
      },
    }

    let included: Resource[] = []

    if (model.Permissions) {
      this.aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'permission')
      )

      included = included = included.concat(
        this.permissionResource.toArrayOfResources(model.Permissions)
      )
    }

    if (model.Users) {
      this.aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'user')
      )
      included = included.concat(
        this.userResource.toArrayOfResources(model.Users)
      )
    }

    if (included.length > 0) resource.included = included

    return resource
  }
}

export default RoleResource
