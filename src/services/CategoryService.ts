import { CategoryDTO } from '@/api/dtos'
import { NotFoundError } from '@/api/errors'
import { Category } from '@/models'
import { FindOptions, ModelStatic } from 'sequelize'
import { Inject, Service } from 'typedi'
import { ResourceService } from './ResourceService'

@Service()
export class CategoryService extends ResourceService<Category, CategoryDTO> {
  constructor(
    @Inject('Category') categoryModel: ModelStatic<Category>,
    @Inject('Product') private productModel: ModelStatic<ProductModel>
  ) {
    super(categoryModel)
  }

  async create(categoryDTO: CategoryDTO): Promise<Category> {
    try {
      const category = await this.model.create({
        ...categoryDTO.attributes,
      })

      return category
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Get the parent category of a category by its id or throw an error
   *
   * @param id Category id
   * @throws {NotFoundError} if the category does not exist or doesn't have parent
   */
  async findParentCategoryByPK(
    id: string,
    options: FindOptions
  ): Promise<Category> {
    try {
      const category = await this.findByPK(id)
      const parent_category_id = category.getDataValue('parent_category_id')

      if (parent_category_id === null) {
        throw new NotFoundError({
          detail: "This category doesn't have a parent category",
        })
      }

      const parent_category = await this.findByPK(
        parent_category_id.toString(),
        options
      )

      return parent_category
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * List all products that belongs to a specified category
   *
   * @param category_id Category id
   * @param options Query options
   * @returns Products that belongs to this category
   */
  async findCategoryProducts(
    category_id: string,
    options: FindOptions
  ): Promise<{ instances: ProductModel[]; count: number }> {
    return this.findAndCountAllOwned(
      this.productModel,
      category_id,
      options,
      'category_id'
    )
  }
}
