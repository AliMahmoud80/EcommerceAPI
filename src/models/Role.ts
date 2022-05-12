import sequelize from '@/lib/sequelize'
import { IRole } from '@/interfaces'
import {
  DataTypes,
  Optional,
  Model,
  NonAttribute,
  Association,
  HasManySetAssociationsMixin,
  HasManyGetAssociationsMixin,
  HasManyCountAssociationsMixin,
} from 'sequelize'
import { User, Permission } from '@/models'

type RoleCreationAttributes = Optional<
  IRole,
  'id' | 'created_at' | 'updated_at'
>

export class Role extends Model<IRole, RoleCreationAttributes> {
  declare Permissions?: NonAttribute<Permission[]>
  declare Users?: NonAttribute<User[]>

  declare setPermissions: HasManySetAssociationsMixin<Permission, number>
  declare countPermissions: HasManyCountAssociationsMixin
  declare getUsers: HasManyGetAssociationsMixin<User>
  declare getPermissions: HasManyGetAssociationsMixin<Permission>

  declare static associations: {
    Permissions: Association<Role, Permission>
  }
}

Role.init(
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
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'role',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
)

Role.hasMany(User, {
  foreignKey: 'role_id',
})
User.belongsTo(Role, {
  foreignKey: 'role_id',
  onDelete: 'SET DEFAULT',
  onUpdate: 'CASCADE',
})
