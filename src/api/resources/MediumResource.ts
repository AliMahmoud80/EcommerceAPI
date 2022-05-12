import { JsonResource } from './JsonResource'
import { Inject, Service } from 'typedi'
import { Medium } from '@/models'
import { IMediumResource } from '@/interfaces'
import config from '@/config'
import UserResource from './UserResource'

@Service()
export class MediumResource extends JsonResource<Medium, IMediumResource> {
  @Inject(() => UserResource)
  private userResource: UserResource

  constructor() {
    super()
  }

  toResource(model: Medium): IMediumResource {
    const resource: IMediumResource = {
      id: model.getDataValue('id').toString(),
      type: 'Medium',
      attributes: {
        original_name: model.getDataValue('original_name'),
        path: this.getMediumPath(model),
        extension: model.getDataValue('extension'),
        size: model.getDataValue('size'),
        created_at: model.getDataValue('created_at'),
      },
      relationships: {
        owner: {
          data: {
            id: model.getDataValue('user_id').toString(),
            type: 'User',
          },
        },
      },
    }

    const included: Resource[] = []

    if (model.User) {
      included.push(this.userResource.toResource(model.User))
    }

    if (included.length > 0) resource.included = included

    return resource
  }

  /**
   * Get medium path
   *
   * @param medium Medium to get path for
   * @returns Medium path
   */
  private getMediumPath(medium: Medium): string {
    return `${config.app.url}/storage/${medium.getDataValue(
      's3_key'
    )}.${medium.getDataValue('extension')}`
  }
}

export default MediumResource
