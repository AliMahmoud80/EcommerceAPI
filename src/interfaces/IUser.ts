import {
  IRoleResource,
  IReviewResource,
  IOrderResource,
  IPaymentResource,
  IMediumResource,
} from '@/interfaces'

export interface IUser {
  id: number
  first_name: string
  last_name: string
  email: string
  password?: string
  phone_number: string
  country: string
  region: string
  address: string
  role_id: number
  created_at: string
  updated_at: string
}

export interface IUserResource {
  id: string
  type: 'User'
  attributes: {
    first_name: string
    last_name: string
    email: string
    phone_number: string
    country: string
    region: string
    address: string
    created_at?: string
    updated_at?: string
  }
  relationships: {
    role: Relationship<IRoleResource>
    reviews: Relationship<IReviewResource>
    orders: Relationship<IOrderResource>
    payments: Relationship<IPaymentResource>
    media: Relationship<IMediumResource>
  }
  included?: Resource[]
}

export interface IUserPayload {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  country: string
  region: string
  address: string
  role_id: string
  supplier: {
    name: string
    email: string
    phone_number: string
    country: string
    region: string
    address: string
    created_at: string
    updated_at: string
  } | null
  created_at: string
  updated_at: string
  iat: number
  exp: number
}
