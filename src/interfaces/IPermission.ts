export interface IPermission {
  id: number
  name: string
}
export interface IPermissionResource {
  id: string
  type: 'Permission'
  attributes: {
    name: string
  }
}
