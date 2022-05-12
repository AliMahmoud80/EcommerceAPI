import { JsonResource } from './JsonResource'
import { Inject, Service } from 'typedi'
import { User } from '@/models'
import { IUserResource } from '@/interfaces'
import config from '@/config'
import RoleResource from './RoleResource'
import OrderResource from './OrderResource'
import MediumResource from './MediumResource'
import ReviewResource from './ReviewResource'
import PaymentResource from './PaymentResource'

@Service()
export class UserResource extends JsonResource<User, IUserResource> {
  @Inject(() => RoleResource)
  private roleResource: RoleResource

  constructor(
    private orderResource: OrderResource,
    private medeiaResource: MediumResource,
    private reviewResource: ReviewResource,
    private paymentResource: PaymentResource
  ) {
    super()
  }

  toResource(model: User): IUserResource {
    const resource: IUserResource = {
      id: model.getDataValue('id').toString(),
      type: 'User',
      attributes: {
        first_name: model.getDataValue('first_name'),
        last_name: model.getDataValue('last_name'),
        email: model.getDataValue('email'),
        phone_number: model.getDataValue('phone_number'),
        country: model.getDataValue('country'),
        region: model.getDataValue('region'),
        address: model.getDataValue('address'),
        created_at: model.getDataValue('created_at'),
        updated_at: model.getDataValue('updated_at'),
      },
      relationships: {
        role: {
          data: {
            id: model.getDataValue('role_id').toString(),
            type: 'Role',
          },
        },
        orders: {
          links: {
            self:
              config.app.url +
              '/users/' +
              model.getDataValue('id').toString() +
              '/orders',
          },
        },
        reviews: {
          links: {
            self:
              config.app.url +
              '/users/' +
              model.getDataValue('id').toString() +
              '/reviews',
          },
        },
        media: {
          links: {
            self:
              config.app.url +
              '/users/' +
              model.getDataValue('id').toString() +
              '/media',
          },
        },
        payments: {
          links: {
            self:
              config.app.url +
              '/users/' +
              model.getDataValue('id').toString() +
              '/payemnts',
          },
        },
      },
    }

    let included: Resource[] = []

    if (model.Role) {
      this.aclService.authorizeUserOrFail((ability) =>
        ability.can('readAll', 'role')
      )

      included.push(this.roleResource.toResource(model.Role))
    }

    if (model.Orders) {
      this.aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'order') ||
          ability.can('read', {
            user_id: model.getDataValue('id').toString(),
            __subjectType: 'order',
          })
      )

      included = included.concat(
        this.orderResource.toArrayOfResources(model.Orders)
      )
    }

    if (model.Media) {
      this.aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'medium') ||
          ability.can('read', {
            user_id: model.getDataValue('id').toString(),
            __subjectType: 'medium',
          })
      )

      included.concat(this.medeiaResource.toArrayOfResources(model.Media))
    }

    if (model.Reviews) {
      this.aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'review') ||
          ability.can('read', {
            user_id: model.getDataValue('id').toString(),
            __subjectType: 'review',
          })
      )

      included = included.concat(
        this.reviewResource.toArrayOfResources(model.Reviews)
      )
    }

    if (model.Payments) {
      this.aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'payment') ||
          ability.can('read', {
            user_id: model.getDataValue('id').toString(),
            __subjectType: 'payment',
          })
      )

      included = included.concat(
        this.paymentResource.toArrayOfResources(model.Payments)
      )
    }

    if (included.length > 0) resource.included = included

    return resource
  }
}

export default UserResource
