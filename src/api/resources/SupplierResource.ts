import { JsonResource } from './JsonResource'
import { Inject, Service } from 'typedi'
import { Supplier } from '@/models'
import { ISupplierResource } from '@/interfaces'
import config from '@/config'
import UserResource from './UserResource'
import ProductResource from './ProductResource'

@Service()
export class SupplierResource extends JsonResource<
  Supplier,
  ISupplierResource
> {
  @Inject(() => UserResource)
  private userResource: UserResource

  @Inject(() => ProductResource)
  private productResource: ProductResource

  constructor() {
    super()
  }

  toResource(model: Supplier): ISupplierResource {
    const resource: ISupplierResource = {
      id: model.getDataValue('user_id').toString(),
      type: 'Supplier',
      attributes: {
        name: model.getDataValue('name'),
        email: model.getDataValue('email'),
        phone_number: model.getDataValue('phone_number'),
        country: model.getDataValue('country'),
        region: model.getDataValue('region'),
        address: model.getDataValue('address'),
        balance: model.getDataValue('balance'),
        created_at: model.getDataValue('created_at'),
        updated_at: model.getDataValue('updated_at'),
      },
      relationships: {
        user: {
          links: {
            self:
              config.app.url +
              '/suppliers/' +
              model.getDataValue('user_id') +
              '/user',
          },
          data: {
            id: model.getDataValue('user_id').toString(),
            type: 'User',
          },
        },
        products: {
          links: {
            self:
              config.app.url +
              '/suppliers/' +
              model.getDataValue('user_id') +
              '/products',
          },
        },
        sales: {
          links: {
            self:
              config.app.url +
              '/suppliers/' +
              model.getDataValue('user_id') +
              '/sales',
          },
        },
      },
    }

    let included: Resource[] = []

    if (model.User) {
      this.aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'user') ||
          ability.can('read', {
            id: model.getDataValue('user_id').toString(),
            __subjectType: 'user',
          })
      )

      included.push(this.userResource.toResource(model.User))
    }

    if (model.Products) {
      this.aclService.authorizeUserOrFail(
        (ability) =>
          ability.can('readAll', 'product') ||
          ability.can('read', {
            supplier_id: model.getDataValue('user_id').toString(),
            __subjectType: 'product',
          })
      )

      included = included.concat(
        this.productResource.toArrayOfResources(model.Products)
      )
    }

    if (included.length > 0) resource.included = included

    return resource
  }
}

export default SupplierResource
