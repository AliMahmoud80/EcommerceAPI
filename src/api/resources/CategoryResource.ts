import { JsonResource } from './JsonResource'
import { Inject, Service } from 'typedi'
import { Category } from '@/models'
import { ICategoryResource } from '@/interfaces'
import config from '@/config'
import ProductResource from './ProductResource'

@Service()
export class CategoryResource extends JsonResource<
  Category,
  ICategoryResource
> {
  @Inject(() => ProductResource)
  private productResource: ProductResource

  constructor() {
    super()
  }

  toResource(model: Category): ICategoryResource {
    const resource: ICategoryResource = {
      id: model.getDataValue('id').toString(),
      type: 'Category',
      attributes: {
        name: model.getDataValue('name'),
        created_at: model.getDataValue('created_at'),
        updated_at: model.getDataValue('updated_at'),
      },
      relationships: {
        parent_category: undefined,
        products: {
          links: {
            self:
              config.app.url +
              '/categories/' +
              model.getDataValue('id').toString() +
              '/products',
          },
        },
      },
    }

    const parent_category_id = model.getDataValue('parent_category_id')

    if (parent_category_id) {
      resource.relationships.parent_category = {
        data: {
          id: parent_category_id.toString(),
          type: 'Category',
        },
      }
    }

    let included: Resource[] = []

    if (model.Products) {
      included = included.concat(
        this.productResource.toArrayOfResources(model.Products)
      )
    }

    if (included.length > 0) resource.included = included

    return resource
  }
}

export default CategoryResource
