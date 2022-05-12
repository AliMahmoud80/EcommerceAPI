import { IUserResource } from '@/interfaces'

export interface IMedium {
  id: number
  user_id: number
  s3_key: string
  original_name: string
  size: number
  extension: string
  created_at: string
}

export interface IMediumResource {
  id: string
  type: 'Medium'
  attributes: {
    original_name: string
    path: string
    extension: string
    size: number
    created_at: string
  }
  relationships: {
    owner: Relationship<IUserResource>
  }
  included?: Resource[]
}
