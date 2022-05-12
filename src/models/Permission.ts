import sequelize from '@/lib/sequelize'
import { IPermission } from '@/interfaces'
import { DataTypes, Optional, Model, NonAttribute } from 'sequelize'
import { Role } from '@/models'

type PermissionCreationAttributes = Optional<IPermission, 'id'>

export class Permission extends Model<
  IPermission,
  PermissionCreationAttributes
> {
  declare Roles?: NonAttribute<Role[]>
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'permission',
    updatedAt: false,
    underscored: true,
    timestamps: false,
  }
)
