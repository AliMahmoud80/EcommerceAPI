import sequelize from '@/lib/sequelize'
import {
  Model,
  Optional,
  DataTypes,
  Association,
  NonAttribute,
  HasManySetAssociationsMixin,
  HasOneGetAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyGetAssociationsMixin,
} from 'sequelize'
import { IOrder } from '@/interfaces'
import { User, Product, Payment } from '@/models'

type OrderCreationAttributes = Optional<
  IOrder,
  'id' | 'status' | 'created_at' | 'updated_at'
>

export class Order extends Model<IOrder, OrderCreationAttributes> {
  declare Products: NonAttribute<Product[]>
  declare User: NonAttribute<User>
  declare Payment: NonAttribute<Payment>

  declare getUser: HasOneGetAssociationMixin<User>
  declare countProducts: HasManyCountAssociationsMixin
  declare getProducts: HasManyGetAssociationsMixin<Product>
  declare getPayment: HasOneGetAssociationMixin<Payment>

  declare createProducts: HasManySetAssociationsMixin<
    Product,
    { id: number; quantity: number }
  >

  declare static associations: {
    Products: Association<Order, Product>
  }
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'canceled',
        'confirmed',
        'shipping',
        'received'
      ),
      defaultValue: 'pending',
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'order',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
)

User.hasMany(Order, {
  foreignKey: 'user_id',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE',
})

Order.belongsTo(User)
