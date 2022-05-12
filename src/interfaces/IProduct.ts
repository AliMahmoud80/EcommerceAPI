import {
  ICategoryResource,
  IReviewResource,
  ISupplierResource,
} from '@/interfaces'

export interface IProduct {
  id: number
  supplier_id: number
  category_id: number | null
  title: string
  content: string
  price: number
  stock: number
  thumbnails: string[]
  created_at: string
  updated_at: string
}

export interface IProductResource {
  id: string
  type: 'Product'
  attributes: {
    title: string
    content: string
    price: number
    stock: number
    thumbnails: string[]
    created_at: string
    updated_at: string
  }

  relationships: {
    supplier: Relationship<ISupplierResource>
    reviews: Relationship<IReviewResource>
    category: Relationship<ICategoryResource> | null
  }

  included?: Resource[]
}
