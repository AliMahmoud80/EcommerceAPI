import {
  SupplierDTO,
  UserDTO,
  CategoryDTO,
  ProductDTO,
  RoleDTO,
  ReviewDTO,
  OrderDTO,
} from '@/api/dtos'
import {
  IUserResource,
  IPermissionResource,
  IRoleResource,
  IOrderResource,
  IPaymentResource,
  IProductResource,
  IReviewResource,
  ICategoryResource,
  ISupplierResource,
  IMediumResource,
  ISaleResource,
} from '@/interfaces'
import {
  Category,
  Medium,
  Order,
  Payment,
  Permission,
  Product,
  Review,
  Role,
  Supplier,
  User,
} from '@/models'

declare global {
  export type Resource =
    | IUserResource
    | IPermissionResource
    | IRoleResource
    | IOrderResource
    | IPaymentResource
    | IProductResource
    | IReviewResource
    | ICategoryResource
    | ISupplierResource
    | IMediumResource
    | ISaleResource

  export type DTO =
    | UserDTO
    | SupplierDTO
    | RoleDTO
    | CategoryDTO
    | ProductDTO
    | ReviewDTO
    | OrderDTO

  export type Relationship<IResource> = {
    links?: {
      self: string
    }
    data?: Omit<IResource, 'attributes' | 'relationships' | 'included'>
  }

  type QueryParams = {
    limit?: any
    page?: any
    sort?: any
    fields?: any
    include?: any
    filter?: any
  }

  export type UserModel = User
  export type SupplierModel = Supplier
  export type RoleModel = Role
  export type CategoryModel = Category
  export type ProductModel = Product
  export type ReviewModel = Review
  export type OrderModel = Order
  export type PaymentModel = Payment
  export type MediumModel = Medium
  export type PermissionModel = Permission
}
