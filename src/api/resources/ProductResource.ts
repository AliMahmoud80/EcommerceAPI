import { JsonResource } from './JsonResource'
import { Service } from 'typedi'
import { Product } from '@/models'
import { IProductResource } from '@/interfaces'
import config from '@/config'
import SupplierResource from './SupplierResource'
import ReviewResource from './ReviewResource'
import CategoryResource from './CategoryResource'

@Service()
export class ProductResource extends JsonResource<Product, IProductResource> {
  constructor(
    private supplierResource: SupplierResource,
    private reviewResource: ReviewResource,
    private categoryResource: CategoryResource
  ) {
    super()
  }

  toResource(model: Product): IProductResource {
    const resource: IProductResource = {
      id: model.getDataValue('id').toString(),
      type: 'Product',
      attributes: {
        title: model.getDataValue('title'),
        content: model.getDataValue('content'),
        price: model.getDataValue('price'),
        stock: model.getDataValue('stock'),
        thumbnails: model.getDataValue('thumbnails'),
        created_at: model.getDataValue('created_at'),
        updated_at: model.getDataValue('updated_at'),
      },
      relationships: {
        supplier: {
          data: {
            id: model.getDataValue('supplier_id').toString(),
            type: 'Supplier',
          },
        },
        reviews: {
          links: {
            self:
              config.app.url +
              '/products/' +
              model.getDataValue('id').toString() +
              '/reviews',
          },
        },
        category: null,
      },
    }

    const category_id = model.getDataValue('category_id')

    if (category_id) {
      resource.relationships.category = {
        data: {
          id: category_id.toString(),
          type: 'Category',
        },
      }
    }

    let included: Resource[] = []

    if (model.Category) {
      included.push(this.categoryResource.toResource(model.Category))
    }

    if (model.Supplier) {
      included.push(this.supplierResource.toResource(model.Supplier))
    }

    if (model.Reviews) {
      included = included.concat(
        this.reviewResource.toArrayOfResources(model.Reviews)
      )
    }

    if (included.length > 0) resource.included = included

    return resource
  }
}

export default ProductResource
