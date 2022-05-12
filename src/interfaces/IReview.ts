import { IProductResource } from './IProduct'
import { IUserResource } from './IUser'

export interface IReview {
  id: number
  user_id: number
  product_id: number
  content: string
  rate: number
  created_at: string
  updated_at: string
}

export interface IReviewResource {
  id: string
  type: 'Review'
  attributes: {
    content: string
    rate: number
    created_at: string
    updated_at: string
  }

  relationships: {
    owner: Relationship<IUserResource>
    product: Relationship<IProductResource>
  }

  included?: Resource[]
}
