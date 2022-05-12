import { IPermissionResource } from '@/interfaces'
import { JsonResource } from '@/api/resources'
import { Service } from 'typedi'
import { Permission } from '@/models'

@Service()
export class PermissionResource extends JsonResource<
  Permission,
  IPermissionResource
> {
  constructor() {
    super()
  }

  toResource(model: Permission): IPermissionResource {
    const resource: IPermissionResource = {
      id: model.getDataValue('id').toString(),
      type: 'Permission',
      attributes: {
        name: model.getDataValue('name'),
      },
    }

    return resource
  }
}

export default PermissionResource
