import { JsonResource } from './JsonResource'
import { Inject, Service } from 'typedi'
import { Order } from '@/models'
import { IOrderResource } from '@/interfaces'
import config from '@/config'
import UserResource from './UserResource'
import ProductResource from './ProductResource'

@Service()
export class OrderResource extends JsonResource<Order, IOrderResource> {
  @Inject(() => UserResource)
  private userResource: UserResource

  @Inject(() => ProductResource)
  private productResource: ProductResource

  constructor() {
    super()
  }

  toResource(model: Order): IOrderResource {
    const resource: IOrderResource = {
      id: model.getDataValue('id').toString(),
      type: 'Order',
      attributes: {
        user_id: model.getDataValue('id').toString(),
        status: model.getDataValue('status'),
        created_at: model.getDataValue('created_at'),
        updated_at: model.getDataValue('updated_at'),
      },
      relationships: {
        owner: {
          data: {
            id: model.getDataValue('id').toString(),
            type: 'User',
          },
        },
        products: {
          links: {
            self:
              config.app.url +
              '/orders/' +
              model.getDataValue('id').toString() +
              '/products',
          },
        },
      },
    }

    let included: Resource[] = []

    if (model.User) {
      included.push(this.userResource.toResource(model.User))
    }

    if (model.Products) {
      included = included.concat(
        this.productResource.toArrayOfResources(model.Products)
      )
    }

    if (included.length > 0) resource.included = included

    return resource
  }
}

export default OrderResource
