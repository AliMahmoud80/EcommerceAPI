import { Permission } from '@/models'
import { FindOptions, ModelStatic } from 'sequelize'
import { Inject, Service } from 'typedi'
import { RoleDTO } from '@/api/dtos'
import { ResourceService } from './ResourceService'
import { IPermission, IUser } from '@/interfaces'

@Service()
export class RoleService extends ResourceService<RoleModel, RoleDTO> {
  constructor(
    @Inject('Role') private roleModel: ModelStatic<RoleModel>,
    @Inject('User') private userModel: ModelStatic<UserModel>
  ) {
    super(roleModel)
  }

  /**
   * Create a new role
   *
   * @param {PermissionDTO} roleDTO Permission DTO
   * @returns Created Permission
   */
  async create(roleDTO: RoleDTO): Promise<RoleModel> {
    try {
      const rolePermissions: any[] =
        roleDTO.attributes.permissions_ids.map((permission_id: string) =>
          parseInt(permission_id)
        ) || []

      const role = await this.roleModel.create({
        ...roleDTO.attributes,
      })

      await role.setPermissions(rolePermissions)

      return role
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Get all permissions for role
   *
   * @param role_id Role id
   * @returns List of permissions belongs to the role
   */
  async getRolePermissions(role_id: string): Promise<Permission[]> {
    try {
      const role = await this.findByPK(role_id, {
        include: [{ model: Permission, attributes: ['name'] }],
      })

      return role.Permissions || []
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Get users that have a specified role
   *
   * @param roleId Role id
   * @param options Query options
   * @returns role users
   */
  async findRoleUsers(
    roleId: string,
    options: FindOptions<IUser>
  ): Promise<{ instances: UserModel[]; count: number }> {
    const users = await this.findAndCountAllOwned(
      this.userModel,
      roleId,
      options,
      'role_id'
    )

    return users
  }

  /**
   * Get all role permissions
   *
   * @param roleId Role id
   * @param options Query options
   * @returns role permissions
   */
  async findRolePermissions(
    roleId: string,
    options: FindOptions<IPermission>
  ): Promise<{ instances: PermissionModel[]; count: number }> {
    const role = await this.findByPK(roleId)

    const [count, instances] = await Promise.all([
      role.countPermissions(),
      role.getPermissions(options),
    ])

    return {
      instances,
      count,
    }
  }
}
