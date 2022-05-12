import { IPermissionResource, IUserResource } from '@/interfaces'

export interface IRole {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface IRoleResource {
  id: string
  type: 'Role'
  attributes: {
    name: string
    created_at: string
    updated_at: string
  }
  relationships?: {
    permissions: Relationship<IPermissionResource>
    users: Relationship<IUserResource>
  }
  included?: Resource[]
}
