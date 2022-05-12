import { JsonResource } from './JsonResource'
import { Inject, Service } from 'typedi'
import { Review } from '@/models'
import { IReviewResource } from '@/interfaces'
import ProductResource from './ProductResource'
import UserResource from './UserResource'

@Service()
export class ReviewResource extends JsonResource<Review, IReviewResource> {
  @Inject(() => UserResource)
  private userResource: UserResource

  @Inject(() => ProductResource)
  private productResource: ProductResource

  constructor() {
    super()
  }

  toResource(model: Review): IReviewResource {
    const resource: IReviewResource = {
      id: model.getDataValue('id').toString(),
      type: 'Review',
      attributes: {
        content: model.getDataValue('content'),
        rate: model.getDataValue('rate'),
        created_at: model.getDataValue('created_at'),
        updated_at: model.getDataValue('updated_at'),
      },
      relationships: {
        owner: {
          data: {
            id: model.getDataValue('user_id').toString(),
            type: 'User',
          },
        },
        product: {
          data: {
            id: model.getDataValue('product_id').toString(),
            type: 'Product',
          },
        },
      },
    }

    const included: Resource[] = []

    if (model.User) {
      included.push(this.userResource.toResource(model.User))
    }

    if (model.Product) {
      included.push(this.productResource.toResource(model.Product))
    }

    if (included.length > 0) resource.included = included

    return resource
  }
}

export default ReviewResource
