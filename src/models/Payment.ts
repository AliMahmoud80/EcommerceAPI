import sequelize from '@/lib/sequelize'
import {
  Model,
  DataTypes,
  Optional,
  NonAttribute,
  HasOneGetAssociationMixin,
} from 'sequelize'
import { IPayment } from '@/interfaces'
import { User, Order } from '@/models'

type PaymentCreationAttributes = Optional<
  IPayment,
  'id' | 'vendor_data' | 'created_at' | 'updated_at'
>

export class Payment extends Model<IPayment, PaymentCreationAttributes> {
  declare User: NonAttribute<User>
  declare Order: NonAttribute<Order>

  declare getOrder: HasOneGetAssociationMixin<Order>
  declare getUser: HasOneGetAssociationMixin<User>
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    order_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Order,
        key: 'id',
      },
    },
    method: {
      type: DataTypes.STRING,
    },
    amount: {
      type: DataTypes.DOUBLE,
    },
    currency: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
    vendor_id: {
      type: DataTypes.STRING,
    },
    vendor_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'payment',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
)

User.hasMany(Payment)

Payment.belongsTo(User, {
  foreignKey: 'user_id',
  onUpdate: 'RESTRICT',
  onDelete: 'CASCADE',
})

Order.hasOne(Payment)

Payment.belongsTo(Order, {
  foreignKey: 'order_id',
  onUpdate: 'RESTRICT',
  onDelete: 'CASCADE',
})
