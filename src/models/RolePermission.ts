import sequelize from '@/lib/sequelize'
import { DataTypes, Model } from 'sequelize'
import { Role, Permission } from '@/models'

export class RolePermission extends Model {}

RolePermission.init(
  {
    role_id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      references: {
        model: Role,
        key: 'id',
      },
    },
    permission_id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      references: {
        model: Permission,
        key: 'id',
      },
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'role_permission',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
)

Role.belongsToMany(Permission, {
  through: RolePermission,
  onDelete: 'CASCADE',
})

Permission.belongsToMany(Role, {
  through: RolePermission,
  onDelete: 'CASCADE',
})
