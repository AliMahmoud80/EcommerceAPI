import sequelize from '@/lib/sequelize'
import {
  Model,
  Optional,
  DataTypes,
  NonAttribute,
  HasManySetAssociationsMixin,
  Association,
} from 'sequelize'
import { Product, Review, User } from '@/models'
import { ISupplier } from '@/interfaces'

type SupplierCreationAttributes = Optional<
  ISupplier,
  'balance' | 'created_at' | 'updated_at'
>

export class Supplier extends Model<ISupplier, SupplierCreationAttributes> {
  declare User?: NonAttribute<User>
  declare Products?: NonAttribute<Product[]>
  declare Reviews?: NonAttribute<Review[]>

  declare setProducts: HasManySetAssociationsMixin<Product, number>

  declare static associations: {
    Products: Association<Supplier, Product>
    User: Association<Supplier, User>
  }
}

Supplier.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: User,
      },
      key: 'id',
    },
    name: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
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
    balance: {
      type: DataTypes.DOUBLE,
      validate: {
        isDecimal: true,
        isPositive(value: number) {
          if (value < 0) throw new Error('Balance must be positive number')
        },
      },
      defaultValue: 0,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'supplier',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
)

Supplier.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})

User.hasOne(Supplier, {
  foreignKey: 'user_id',
})
