import sequelize from '@/lib/sequelize'
import { Model, DataTypes, Optional, NonAttribute } from 'sequelize'
import { IMedium } from '@/interfaces'
import { User } from '@/models'

type MediumCreationAttributes = Optional<IMedium, 'id' | 'created_at'>

export class Medium extends Model<IMedium, MediumCreationAttributes> {
  declare User: NonAttribute<User>
}

Medium.init(
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
    s3_key: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    original_name: {
      type: DataTypes.STRING(255),
    },
    extension: {
      type: DataTypes.STRING(255),
    },
    size: {
      type: DataTypes.FLOAT,
    },
    created_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'medium',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
)

User.hasMany(Medium, {
  foreignKey: 'user_id',
})

Medium.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})
