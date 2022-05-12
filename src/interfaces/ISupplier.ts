import { IProductResource, ISaleResource, IUserResource } from '@/interfaces'

export interface ISupplier {
  user_id: number
  name: string
  email: string
  phone_number: string
  country: string
  region: string
  address: string
  balance: number
  created_at: string
  updated_at: string
}
export interface ISupplierResource {
  id: string
  type: 'Supplier'
  attributes: {
    name: string
    email: string
    phone_number: string
    country: string
    region: string
    address: string
    balance: number
    created_at: string
    updated_at: string
  }
  relationships: {
    user: Relationship<IUserResource>
    products: Relationship<IProductResource>
    sales: Relationship<ISaleResource>
  }
  included?: Resource[]
}
