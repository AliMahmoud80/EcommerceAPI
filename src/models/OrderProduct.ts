import sequelize from '@/lib/sequelize'
import { Model, DataTypes, NonAttribute } from 'sequelize'
import { Order, Product } from '@/models'

export class OrderProduct extends Model {
  declare Order: NonAttribute<Order>
  declare Product: NonAttribute<Product>
}

OrderProduct.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Order,
      },
      key: 'id',
    },
    product_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
      },
      key: 'id',
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    created_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'order_product',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
)

OrderProduct.hasOne(Order, {
  foreignKey: 'id',
  sourceKey: 'order_id',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE',
})

OrderProduct.hasOne(Product, {
  foreignKey: 'id',
  sourceKey: 'product_id',
  onUpdate: 'RESTRICT',
  onDelete: 'CASCADE',
})

Order.belongsToMany(Product, {
  through: OrderProduct,
})

Product.belongsToMany(Order, { through: OrderProduct })

Order.belongsTo(OrderProduct, {
  foreignKey: 'id',
})

Product.belongsTo(OrderProduct, {
  foreignKey: 'id',
})
