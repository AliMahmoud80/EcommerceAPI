import { IProductResource } from './IProduct'
import { IUserResource } from './IUser'

export interface IOrder {
  id: number
  user_id: number
  status: 'pending' | 'canceled' | 'confirmed' | 'shipping' | 'received'
  created_at: string
  updated_at: string
}

export interface IOrderResource {
  id: string
  type: 'Order'
  attributes: {
    user_id: string
    status: 'pending' | 'canceled' | 'confirmed' | 'shipping' | 'received'
    created_at: string
    updated_at: string
  }
  relationships: {
    owner: Relationship<IUserResource>
    products: Relationship<IProductResource>
  }
  included?: Resource[]
}
