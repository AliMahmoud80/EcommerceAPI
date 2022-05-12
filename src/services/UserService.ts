import { ResourceService } from './ResourceService'
import { Inject, Service } from 'typedi'
import { FindOptions, ModelStatic } from 'sequelize'
import { UserDTO } from '@/api/dtos'
import { IMedium, IOrder, IPayment, IReview } from '@/interfaces'

@Service()
export class UserService extends ResourceService<UserModel, UserDTO> {
  constructor(
    @Inject('User') userModel: ModelStatic<UserModel>,
    @Inject('Payment') private paymentModel: ModelStatic<PaymentModel>,
    @Inject('Review') private reviewModel: ModelStatic<ReviewModel>,
    @Inject('Order') private orderModel: ModelStatic<OrderModel>,
    @Inject('Medium') private mediumModel: ModelStatic<MediumModel>
  ) {
    super(userModel)
  }

  /**
   * Create a new user
   *
   * @param {UserDTO} userDTO User DTO
   * @returns Created user
   */
  async create(userDTO: UserDTO): Promise<UserModel> {
    try {
      const user = await this.model.create(userDTO.attributes)

      return user
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Get all user reviews by PK
   *
   * @param userId User id
   * @param options Query options
   * @returns User reviews
   */
  async findUserReviews(
    userId: string,
    options: FindOptions<IReview>
  ): Promise<{ instances: ReviewModel[]; count: number }> {
    const reviews = await this.findAndCountAllOwned(
      this.reviewModel,
      userId,
      options
    )

    return reviews
  }

  /**
   * Get all user orders by PK
   *
   * @param userId User id
   * @param options Query options
   * @returns User reviews
   */
  async findUserOrders(
    userId: string,
    options: FindOptions<IOrder>
  ): Promise<{ instances: OrderModel[]; count: number }> {
    const orders = await this.findAndCountAllOwned(
      this.orderModel,
      userId,
      options
    )

    return orders
  }

  /**
   * Get all user media by PK
   *
   * @param userId User id
   * @param options Query options
   * @returns User reviews
   */
  async findUserMedia(
    userId: string,
    options: FindOptions<IMedium>
  ): Promise<{ instances: MediumModel[]; count: number }> {
    const media = await this.findAndCountAllOwned(
      this.mediumModel,
      userId,
      options
    )

    return media
  }

  /**
   * Get all user payments by PK
   *
   * @param userId User id
   * @param options Query options
   * @returns User reviews
   */
  async findUserPayments(
    userId: string,
    options: FindOptions<IPayment>
  ): Promise<{ instances: PaymentModel[]; count: number }> {
    const payments = await this.findAndCountAllOwned(
      this.paymentModel,
      userId,
      options
    )

    return payments
  }
}
