import { ReviewDTO } from '@/api/dtos'
import { ConflictError, ForbiddenOperation } from '@/api/errors'
import { Review } from '@/models'
import { FindOptions, ModelStatic } from 'sequelize'
import { Inject, Service } from 'typedi'
import OrderService from './OrderService'
import { ResourceService } from './ResourceService'
import { UniqueConstraintError } from 'sequelize'

@Service()
export class ReviewService extends ResourceService<Review, ReviewDTO> {
  constructor(
    @Inject('Review') reviewModel: ModelStatic<ReviewModel>,
    private orderService: OrderService
  ) {
    super(reviewModel)
  }

  async create(reviewDTO: ReviewDTO, userId: string): Promise<Review> {
    try {
      // As the user can't review a product that he didn't purchased and received
      const userOrdered = await this.orderService.didUserOrdered(
        userId,
        reviewDTO.attributes.product_id
      )

      if (!userOrdered) {
        throw new ForbiddenOperation({
          detail:
            "You can't review an order that you didn't purchased and received",
        })
      }

      const review = await this.model.create({
        user_id: parseInt(userId),
        ...reviewDTO.attributes,
        product_id: parseInt(reviewDTO.attributes.product_id),
      })

      return review
    } catch (e) {
      if (e instanceof UniqueConstraintError) {
        throw new ConflictError({ detail: 'User already reviewed the product' })
      }
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Find review owner
   *
   * @param review_id Review id
   * @param options Query options
   */
  async findReviewOwner(
    review_id: string,
    options: FindOptions
  ): Promise<UserModel> {
    try {
      const review = await this.findByPK(review_id)

      const user = await review.getUser(options)

      return user
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Find reviewed product
   *
   * @param review_id Review id
   * @param options Query options
   */
  async findReviewedProduct(
    review_id: string,
    options: FindOptions
  ): Promise<ProductModel> {
    try {
      const review = await this.findByPK(review_id)

      const product = await review.getProduct(options)

      return product
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }
}
