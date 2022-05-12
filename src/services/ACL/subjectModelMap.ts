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
import { ModelStatic } from 'sequelize'

/**
 * Object to map subject name to its model
 */
const subjectModelMap: { [k: string]: ModelStatic<any> } = {
  user: User,
  supplier: Supplier,
  product: Product,
  review: Review,
  category: Category,
  medium: Medium,
  order: Order,
  payment: Payment,
  role: Role,
  permission: Permission,
}

export default subjectModelMap
