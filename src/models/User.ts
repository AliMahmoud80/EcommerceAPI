import sequelize from '@/lib/sequelize'
import {
  DataTypes,
  HasManyGetAssociationsMixin,
  Model,
  NonAttribute,
  Optional,
} from 'sequelize'
import { IUser } from '@/interfaces'
import { Role, Supplier, Order, Medium, Payment, Review } from '@/models'
import { hashPassword } from '@/services'

type UserCreationAttributes = Optional<
  IUser,
  'id' | 'role_id' | 'created_at' | 'updated_at'
>

export class User extends Model<IUser, UserCreationAttributes> {
  declare Role: NonAttribute<Role>
  declare Supplier: NonAttribute<Supplier>
  declare Orders: NonAttribute<Order[]>
  declare Media: NonAttribute<Medium[]>
  declare Payments: NonAttribute<Payment[]>
  declare Reviews: NonAttribute<Review[]>

  declare getOrders: HasManyGetAssociationsMixin<Order>
  declare getReviews: HasManyGetAssociationsMixin<Review>
  declare getMedia: HasManyGetAssociationsMixin<Medium>
  declare getPayments: HasManyGetAssociationsMixin<Payment>
}

User.init(
  {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    first_name: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    country: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT('medium'),
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
      references: {
        model: Role,
        key: 'id',
      },
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'user',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: {
      attributes: {
        exclude: ['password'],
      },
    },
    hooks: {
      beforeCreate: async (user) => {
        // Hash password before insert
        const password = user.getDataValue('password')
        const hashedPassword = hashPassword(password as string)

        user.setDataValue('password', hashedPassword)
      },
    },
  }
)
