import { NotFoundError } from '@/api/errors'
import { Permission } from '@/models'
import { FindOptions, ModelStatic } from 'sequelize'
import { Inject, Service } from 'typedi'
import { Logger } from 'winston'

@Service()
export class PermissionService {
  constructor(
    @Inject('Permission') private permissionModel: ModelStatic<Permission>,
    @Inject('logger') private logger: Logger
  ) {}

  /**
   * Get list of permissions
   *
   * @param {FindOptions} options Sequelize Options
   * @returns Paginated list of permissions
   */
  async findAll(options?: FindOptions): Promise<Permission[]> {
    try {
      const permissions = await this.permissionModel.findAll(options)

      return permissions
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Get list of permissions
   *
   * @param {FindOptions} options Sequelize Options
   * @returns Paginated list of permissions
   */
  async findAndCountAll(
    options?: FindOptions
  ): Promise<{ instances: Permission[]; count: number }> {
    try {
      const permissions = await this.permissionModel.findAndCountAll(options)

      return { instances: permissions.rows, count: permissions.count }
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Get permission by primary key
   *
   * @param id Permisson id
   * @param {FindOptions} options Sequelize options
   * @throws {NotFoundError} When requested permission doesn't exist
   * @returns Requested permission
   */
  async findByPK(id: string, options?: FindOptions): Promise<Permission> {
    try {
      const permission = await this.permissionModel.findByPk(id, options)

      if (!permission) throw new NotFoundError()

      return permission
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Delete permission by primary key
   *
   * @param id Permission id to be deleted
   * @throws {NotFoundError} When there is no permission with provided id
   */
  async deleteByPK(id: string) {
    try {
      const deletedCount = await this.permissionModel.destroy({
        where: { id: id },
      })

      if (deletedCount === 0) throw new NotFoundError()
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }
}
