import { ProductDTO } from '@/api/dtos'
import { NotFoundError } from '@/api/errors'
import { Product } from '@/models'
import deepmerge from 'deepmerge'
import { FindOptions, ModelStatic } from 'sequelize'
import { Inject, Service } from 'typedi'
import { ResourceService } from './ResourceService'

@Service()
export class ProductService extends ResourceService<Product, ProductDTO> {
  constructor(
    @Inject('Product') productModel: ModelStatic<Product>,
    @Inject('Review') private reviewModel: ModelStatic<ReviewModel>,
    @Inject('Supplier') private supplierModel: ModelStatic<SupplierModel>
  ) {
    super(productModel)
  }

  async create(productDTO: ProductDTO, supplier_id: string): Promise<Product> {
    try {
      // @ts-ignore
      const product = await this.model.create({
        supplier_id: parseInt(supplier_id),
        ...productDTO.attributes,
      })

      return product
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Get product category
   *
   * @param product_id Product id
   * @param options Query options
   * @returns Product category
   */
  async findProductCategory(
    product_id: string,
    options: FindOptions
  ): Promise<CategoryModel> {
    try {
      const product = await this.findByPK(product_id, {
        attributes: ['category_id'],
      })
      const productCategory = await product.getCategory(options)

      if (!productCategory)
        throw new NotFoundError({
          detail: "This product doesn't belong to any category",
        })

      return productCategory
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Get product supplier
   *
   * @param product_id Product id
   * @param options Query options
   * @returns Product supplier
   */
  async findProductSupplier(
    product_id: string,
    options: FindOptions
  ): Promise<SupplierModel> {
    try {
      const product = await this.findByPK(product_id, {
        attributes: ['supplier_id'],
      })

      const productSupplier = product.getSupplier(options)

      return productSupplier
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * List all product reviews
   *
   * @param product_id Product id
   * @param options Query options
   * @returns Product reviews
   */
  async findProductReviews(
    product_id: string,
    options: FindOptions
  ): Promise<{ instances: ReviewModel[]; count: number }> {
    try {
      const reviews = await this.reviewModel.findAndCountAll(
        deepmerge(options, {
          where: {
            product_id: parseInt(product_id),
          },
        })
      )

      return { instances: reviews.rows, count: reviews.count }
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }
}
