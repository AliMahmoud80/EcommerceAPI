import sequelize from '@/lib/sequelize'
import { Model, Optional, DataTypes, NonAttribute } from 'sequelize'
import { ICategory } from '@/interfaces'
import { Product } from '@/models'

type CategoryCreationAttributes = Optional<
  ICategory,
  'id' | 'parent_category_id' | 'created_at' | 'updated_at'
>

export class Category extends Model<ICategory, CategoryCreationAttributes> {
  declare Products: NonAttribute<Product[]>
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      unique: true,
    },
    parent_category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Category,
        key: 'id',
      },
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'category',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
)

Category.hasOne(Category, {
  foreignKey: 'parent_category_id',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
})

Category.belongsTo(Category, {
  foreignKey: 'parent_category_id',
})

Category.hasMany(Product)

Product.belongsTo(Category, {
  foreignKey: 'category_id',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
})
