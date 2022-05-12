import { ISaleResource } from '@/interfaces'
import { JsonResource } from '@/api/resources'
import { Service } from 'typedi'
import { OrderProduct } from '@/models'

@Service()
export class SaleResource extends JsonResource<OrderProduct, ISaleResource> {
  constructor() {
    super()
  }

  toResource(model: OrderProduct): ISaleResource {
    const resource: ISaleResource = {
      id: model.getDataValue('id').toString(),
      type: 'Sale',
      attributes: {
        product_id: model.getDataValue('product_id').toString(),
        quantity: model.getDataValue('quantity'),
      },
    }

    return resource
  }
}

export default SaleResource
