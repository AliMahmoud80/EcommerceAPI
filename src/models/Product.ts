import sequelize from '@/lib/sequelize'
import {
  Model,
  Optional,
  DataTypes,
  NonAttribute,
  HasOneGetAssociationMixin,
} from 'sequelize'
import { IProduct } from '@/interfaces'
import { Supplier, Category, Review } from '@/models'

type ProductCreationAttributes = Optional<
  IProduct,
  'id' | 'category_id' | 'created_at' | 'updated_at'
>

export class Product extends Model<IProduct, ProductCreationAttributes> {
  declare Supplier: NonAttribute<Supplier>
  declare Category: NonAttribute<Category>
  declare Reviews: NonAttribute<Review[]>

  declare getCategory: HasOneGetAssociationMixin<Category>
  declare getSupplier: HasOneGetAssociationMixin<Supplier>
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Supplier,
        key: 'id',
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: Category,
        key: 'id',
      },
    },
    title: {
      type: DataTypes.TEXT('medium'),
    },
    content: {
      type: DataTypes.TEXT('long'),
      // Sanitize data before insert
      // set() {},
    },
    price: {
      type: DataTypes.DOUBLE,
    },
    stock: {
      type: DataTypes.INTEGER,
    },
    thumbnails: {
      type: DataTypes.JSON,
      // Set images urls as json array
      // set() {},

      // Return array of thumbnails
      // get() {},
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'product',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
  }
)

Supplier.hasMany(Product, {
  foreignKey: 'supplier_id',
})

Product.belongsTo(Supplier, {
  foreignKey: 'supplier_id',
})
