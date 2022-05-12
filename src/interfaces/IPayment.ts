import { IUserResource, IOrderResource } from '@/interfaces'

export interface IPayment {
  id: number
  user_id: number
  order_id: number
  vendor_id: string
  method: string
  amount: number
  currency: string
  status: string
  vendor_data: string
  created_at: string
  updated_at: string
}
export interface IPaymentResource {
  id: string
  type: 'Payment'
  attributes: {
    vendor_id: string
    method: string
    amount: number
    currency: string
    status: string
    created_at: string
    updated_at: string
  }
  relationships?: {
    payer: Relationship<IUserResource>
    order: Relationship<IOrderResource>
  }
  included?: Resource[]
}
