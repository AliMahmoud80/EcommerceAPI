import { SupplierDTO } from '@/api/dtos'
import { ConflictError } from '@/api/errors'
import { OrderProduct, Product, Review, Supplier } from '@/models'
import deepmerge from 'deepmerge'
import { FindOptions, ModelStatic } from 'sequelize'
import { Inject, Service } from 'typedi'
import { ResourceService } from './ResourceService'

@Service()
export class SupplierService extends ResourceService<Supplier, SupplierDTO> {
  constructor(
    @Inject('Supplier') supplierModel: ModelStatic<Supplier>,
    @Inject('Product') private productModel: ModelStatic<Product>,
    @Inject('Review') private reviewModel: ModelStatic<Review>,
    @Inject('OrderProduct') private orderProductModel: ModelStatic<OrderProduct>
  ) {
    super(supplierModel)
  }

  /**
   * Create a new supplier
   *
   * @override
   * @param {SupplierDTO} supplierDTO User DTO
   * @returns Created user
   */
  async create(userId: string, supplierDTO: SupplierDTO): Promise<Supplier> {
    try {
      const userSupplier = await this.model.findByPk(userId)

      if (userSupplier)
        throw new ConflictError({
          detail: 'You already have a supplier account',
        })

      const supplier = await this.model.create({
        user_id: parseInt(userId),
        ...supplierDTO.attributes,
      })

      return supplier
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Get all supplier products and their counts
   *
   * @param supplierId Supplier id
   * @param options Query options
   * @returns Supplier products and their count
   */
  async findSupplierProducts(
    supplierId: string,
    options: FindOptions
  ): Promise<{
    instances: ProductModel[]
    count: number
  }> {
    return await this.findAndCountAllOwned(
      this.productModel,
      supplierId,
      options,
      'supplier_id'
    )
  }

  /**
   * Get all reviews to the specified supplier products and their counts
   *
   * @param supplierId Supplier id
   * @param options Query options
   * @returns reviews
   */
  async findSupplierReviews(
    supplierId: string,
    options: FindOptions
  ): Promise<{
    instances: ReviewModel[]
    count: number
  }> {
    await this.findByPK(supplierId)

    const reviews = await this.reviewModel.findAndCountAll(
      deepmerge(
        {
          include: [
            {
              model: this.productModel,
              where: {
                supplier_id: supplierId,
              },
              attributes: ['id'],
            },
          ],
        },
        options
      )
    )

    // Remove unwanted associated products
    reviews.rows.map((review: ReviewModel) => {
      delete review.Product
      return review
    })

    return { instances: reviews.rows, count: reviews.count }
  }

  /**
   * Get all supplier sales and their counts
   *
   * @param supplierId Supplier id
   * @param options Query options
   * @returns Supplier products and their count
   */
  async findSupplierSales(
    supplierId: string,
    options: FindOptions
  ): Promise<{
    instances: OrderProduct[]
    count: number
  }> {
    await this.findByPK(supplierId)
    const sales = await this.orderProductModel.findAndCountAll(
      deepmerge(
        {
          include: [
            {
              model: this.productModel,
              where: {
                supplier_id: supplierId,
              },
              attributes: ['id'],
            },
          ],
        },
        options
      )
    )

    return { instances: sales.rows, count: sales.count }
  }
}
