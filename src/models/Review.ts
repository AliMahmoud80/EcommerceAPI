import sequelize from '@/lib/sequelize'
import {
  Model,
  Optional,
  DataTypes,
  NonAttribute,
  HasOneGetAssociationMixin,
} from 'sequelize'
import { IReview } from '@/interfaces'
import { Product, User } from '@/models'

type ReviewCreationAttributes = Optional<
  IReview,
  'id' | 'created_at' | 'updated_at'
>

export class Review extends Model<IReview, ReviewCreationAttributes> {
  declare User?: NonAttribute<User>
  declare Product?: NonAttribute<Product>

  declare getUser: HasOneGetAssociationMixin<User>
  declare getProduct: HasOneGetAssociationMixin<Product>
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: 'unique_user_product_review',
      references: {
        model: User,
        key: 'id',
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: 'unique_user_product_review',
      references: {
        model: Product,
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT('medium'),
      // TODO: Santize data
      // set: () => {}
    },
    rate: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: true,
        min: 1,
        max: 10,
      },
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'review',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
)

User.hasMany(Review, {
  foreignKey: 'user_id',
})

Review.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})

Product.hasMany(Review, {
  foreignKey: 'product_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})

Review.belongsTo(Product, {
  foreignKey: 'product_id',
  onUpdate: 'CASCADE',
})
