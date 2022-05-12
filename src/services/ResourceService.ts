import { NotFoundError } from '@/api/errors'
import sequelize from '@/lib/sequelize'
import deepmerge from 'deepmerge'
import { FindOptions, Model, ModelStatic } from 'sequelize'
import { Container } from 'typedi'
import { Logger } from 'winston'
export abstract class ResourceService<T extends Model, D extends DTO> {
  protected sequelize = sequelize

  protected logger: Logger

  constructor(protected model: ModelStatic<T>) {
    this.logger = Container.get('logger')
  }

  /**
   * Create a new resource
   * @param args Arguments needed to create the resource
   * @returns Created resource
   */
  abstract create(...args: any[]): Promise<T>

  /**
   * Get list of resources
   *
   * @param {FindOptions} options Sequelize Options
   * @returns List of resources
   */
  async findAll(options?: FindOptions): Promise<T[]> {
    try {
      const resources = await this.model.findAll(options)

      return resources
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Get list of resources with their count
   *
   * @param {FindOptions} options Sequelize Options
   * @returns List of resources
   */
  async findAndCountAll(
    options?: FindOptions
  ): Promise<{ count: number; instances: T[] }> {
    try {
      const resources = await this.model.findAndCountAll(options)

      return { instances: resources.rows, count: resources.count }
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Get resource by primary key
   *
   * @param primaryKeyValue Primary key value of the resource to be retrieved
   * @param {FindOptions} options Sequelize options
   * @throws {NotFoundError} When requested resource doesn't exist
   * @returns Requested resource
   */
  async findByPK(primaryKeyValue: string, options?: FindOptions): Promise<T> {
    try {
      const resource = await this.model.findByPk(primaryKeyValue, options)

      if (!resource) throw new NotFoundError()

      return resource
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Delete resource by primary key
   *
   * @param primaryKeyValue Primary key value of the resource to be deleted
   * @throws {NotFoundError} When there is no resource with the provided key
   */
  async deleteByPK(primaryKeyValue: string, primaryKeyName = 'id') {
    try {
      const deletedCount = await this.model.destroy({
        // @ts-ignore
        where: { [primaryKeyName]: primaryKeyValue },
      })

      if (deletedCount === 0) throw new NotFoundError()
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Update resource using primary key
   *
   * @param primaryKeyValue primary key value of the resource to be updated
   * @param DTO Resource DTO
   * @returns Updated resource
   */
  async updateByPK(primaryKeyValue: string, DTO: D): Promise<T> {
    try {
      const resource = await this.findByPK(primaryKeyValue)

      // @ts-ignore
      await resource.update({ ...DTO.attributes })

      return resource
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * List all resources that is related to a parent resource
   *
   * @param relatedModel Related model to be fetched
   * @param primaryKeyValue Parent resource primary key value
   * @param options Sequelize options
   * @param OwnershipFieldName Field name that will be used to get parent resource related resources
   * @returns Related resources with their count
   */
  async findAndCountAllOwned(
    relatedModel: ModelStatic<any>,
    primaryKeyValue: string,
    options: FindOptions,
    OwnershipFieldName = 'user_id'
  ): Promise<{ count: number; instances: any[] }> {
    try {
      // Make sure parent resource exists
      await this.findByPK(primaryKeyValue)

      const staticOptions: FindOptions = {
        where: { [OwnershipFieldName]: primaryKeyValue },
      }

      const allOptions = deepmerge(staticOptions, options)

      const relatedInstances = await relatedModel.findAndCountAll(allOptions)

      return { instances: relatedInstances.rows, count: relatedInstances.count }
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }
}
