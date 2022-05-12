import { JsonResource } from './JsonResource'
import { Inject, Service } from 'typedi'
import { Payment } from '@/models'
import { IPaymentResource } from '@/interfaces'
import UserResource from './UserResource'
import OrderResource from './OrderResource'

@Service()
export class PaymentResource extends JsonResource<Payment, IPaymentResource> {
  @Inject(() => UserResource)
  private userResource: UserResource

  @Inject(() => OrderResource)
  private orderResource: OrderResource

  constructor() {
    super()
  }

  toResource(model: Payment): IPaymentResource {
    const resource: IPaymentResource = {
      id: model.getDataValue('id').toString(),
      type: 'Payment',
      attributes: {
        vendor_id: model.getDataValue('vendor_id'),
        amount: model.getDataValue('amount'),
        currency: model.getDataValue('currency'),
        method: model.getDataValue('method'),
        status: model.getDataValue('status'),
        created_at: model.getDataValue('created_at'),
        updated_at: model.getDataValue('updated_at'),
      },
      relationships: {
        payer: {
          data: {
            id: model.getDataValue('user_id').toString(),
            type: 'User',
          },
        },
        order: {
          data: {
            id: model.getDataValue('order_id').toString(),
            type: 'Order',
          },
        },
      },
    }

    const included: Resource[] = []

    if (model.User) {
      included.push(this.userResource.toResource(model.User))
    }

    if (model.Order) {
      included.push(this.orderResource.toResource(model.Order))
    }

    if (included.length > 0) resource.included = included

    return resource
  }
}

export default PaymentResource
