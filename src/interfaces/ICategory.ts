import { IProductResource } from './IProduct'

export interface ICategory {
  id: number
  name: string
  parent_category_id: number | null
  created_at: string
  updated_at: string
}

export interface ICategoryResource {
  id: string
  type: 'Category'
  attributes: {
    name: string
    created_at: string
    updated_at: string
  }
  relationships: {
    parent_category: Relationship<ICategoryResource> | undefined
    products: Relationship<IProductResource>
  }
  included?: Resource[]
}
