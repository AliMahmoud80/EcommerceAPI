import { OrderProduct, Payment } from '@/models'
import { Inject, Service } from 'typedi'
import { FindOptions, ModelStatic } from 'sequelize'
import { ResourceService } from './ResourceService'
import { IPayment } from '@/interfaces'
import { Stripe } from 'stripe'
import { BigNumber } from 'bignumber.js'
import stripe from '@/lib/stripe'

@Service()
export class PaymentService extends ResourceService<Payment, any> {
  private stripe: Stripe

  constructor(
    @Inject('Payment') private paymentModel: ModelStatic<Payment>,
    @Inject('OrderProduct')
    private orderProductModel: ModelStatic<OrderProduct>,
    @Inject('Product') private productModel: ModelStatic<ProductModel>,
    @Inject('Supplier') private supplierModel: ModelStatic<SupplierModel>
  ) {
    super(paymentModel)

    this.stripe = stripe
  }

  /**
   * Create a new payment
   *
   * @param {PaymentDTO} paymentDTO Payment DTO
   * @returns Created payment
   */
  async create(paymentObj: IPayment): Promise<Payment> {
    try {
      const payment = await this.paymentModel.create(paymentObj)

      return payment
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Create a new stripe payment intent
   *
   * @param amount Amount of money to be transfered
   * @param currency Payment currency
   *
   * @returns Payment intent
   */
  async createStripePaymentIntent(
    orderId: string,
    userId: string,
    amount: number,
    currency = 'USD'
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        order_id: orderId,
        user_id: userId,
      },
    })

    return paymentIntent
  }

  /**
   * Handle a stripe payment intent succeeded event
   *
   * @param paymentIntent Stripe payment intent
   */
  async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
      await this.sequelize.transaction(async (t) => {
        const payment = await this.paymentModel.create(
          {
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: 'succeeded',
            vendor_id: paymentIntent.id,
            method: 'stripe',
            // @ts-ignore
            order_id: paymentIntent.metadata.order_id.toString(),
            // @ts-ignore
            user_id: paymentIntent.metadata.user_id.toString(),
            vendor_data: JSON.stringify(paymentIntent),
          },
          { transaction: t }
        )

        const order = await payment.getOrder({ transaction: t })

        await order.update({ status: 'confirmed' }, { transaction: t })

        // Increase suppliers balance
        const orderProduct = await this.orderProductModel.findAll({
          where: { order_id: order.getDataValue('id') },
          include: [
            {
              model: this.productModel,
              include: [{ model: this.supplierModel }],
            },
          ],
          transaction: t,
        })

        for (let i = 0; i < orderProduct.length; i++) {
          const totalPricePerProduct = new BigNumber(
            orderProduct[i].Product.getDataValue('price')
          )

          const increasedBalance = totalPricePerProduct
            .times(orderProduct[i].getDataValue('quantity'))
            .toNumber()

          await orderProduct[i].Product.Supplier.increment(
            {
              balance: increasedBalance,
            },
            { transaction: t }
          )
        }
      })
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Refund a stripe payment
   *
   * @param paymentIntent Stripe payment intent
   * @returns Payment refund
   */
  async refundStripePayment(paymentIntent: string) {
    try {
      console.log('called')
      const paymentRefund = await this.stripe.refunds.create({
        payment_intent: paymentIntent,
      })

      return paymentRefund
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Get payment owner
   *
   * @param paymentId Payment ID
   * @param options Query options
   * @returns Payment owner
   */
  async findPaymentOwner(
    paymentId: string,
    options: FindOptions
  ): Promise<UserModel> {
    try {
      const payment = await this.findByPK(paymentId)
      const user = await payment.getUser(options)

      return user
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Get paid order
   *
   * @param paymentId Payment ID
   * @param options Query options
   * @returns Payment owner
   */
  async findPaymentOrder(
    paymentId: string,
    options: FindOptions
  ): Promise<OrderModel> {
    try {
      const payment = await this.findByPK(paymentId)
      const order = await payment.getOrder(options)

      return order
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }
}
