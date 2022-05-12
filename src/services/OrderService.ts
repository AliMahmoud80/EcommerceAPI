import { OrderDTO } from '@/api/dtos'
import { Order, OrderProduct, Product } from '@/models'
import { FindOptions, ModelStatic, QueryTypes } from 'sequelize'
import { Inject, Service } from 'typedi'
import { PaymentService } from './PaymentService'
import { ResourceService } from './ResourceService'
import { ValidationError } from '@/api/errors'
import Stripe from 'stripe'
import { BigNumber } from 'bignumber.js'

@Service()
export class OrderService extends ResourceService<Order, OrderDTO> {
  constructor(
    @Inject('Order') orderModel: ModelStatic<Order>,
    @Inject('OrderProduct')
    private orderProductModel: ModelStatic<OrderProduct>,
    @Inject('Product') private productModel: ModelStatic<Product>,
    private paymentService: PaymentService,
    @Inject('Supplier') private supplierModel: ModelStatic<SupplierModel>
  ) {
    super(orderModel)
  }

  async create(orderDTO: OrderDTO, userId: string): Promise<Order> {
    const t = await this.sequelize.transaction({ autocommit: false })

    try {
      const order = await this.model.create(
        {
          user_id: parseInt(userId),
        },
        { transaction: t }
      )

      const order_products = orderDTO.attributes.order_products.map(
        (product) => {
          return {
            order_id: order.getDataValue('id'),
            product_id: product.id,
            quantity: product.quantity,
          }
        }
      )

      // Create the association between order and ordered products
      await this.orderProductModel.bulkCreate(order_products, {
        transaction: t,
      })

      // Decrease product stock after,
      // user orders products
      for (let i = 0; i < order_products.length; i++) {
        const product = await this.productModel.findByPk(
          order_products[i].product_id,
          {
            transaction: t,
            attributes: ['id', 'title', 'stock'],
          }
        )

        // Throw error if there is no enough stock of the product
        if (
          product &&
          product?.getDataValue('stock') - order_products[i].quantity < 0
        ) {
          throw new ValidationError({
            detail: `Product is out of stock`,
            meta: {
              product_id: product.getDataValue('id').toString(),
              title: product.getDataValue('title'),
              remaining_stock: product.getDataValue('stock'),
            },
          })
        }

        // If there is enough stock
        // Decrease stock of the product
        await product?.decrement(
          { stock: order_products[i].quantity },
          { transaction: t }
        )
      }

      await t.commit()

      return order
    } catch (e) {
      await t.rollback()
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Create a stripe payment intent for an order
   *
   * @param order Order
   */
  async createOrderPaymentIntent(
    order: OrderModel
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    try {
      if (order.getDataValue('status') === 'canceled') {
        throw new ValidationError({
          detail: 'Order is canceled, Please create another order',
        })
      }

      const isPaidOrder = await this.checkIfOrderIsPaid(order)

      if (isPaidOrder)
        throw new ValidationError({ detail: 'Order is already paid' })

      const orderPrice = await this.calculateOrderTotalPrice(
        order.getDataValue('id').toString()
      )

      const paymentIntent = await this.paymentService.createStripePaymentIntent(
        order.getDataValue('id').toString(),
        order.getDataValue('user_id').toString(),
        orderPrice,
        'USD'
      )

      return paymentIntent
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  async checkIfOrderIsPaid(order: OrderModel): Promise<boolean> {
    try {
      const payment = await order.getPayment({
        where: { status: 'succeeded' },
      })

      if (payment) return true

      return false
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Calculate total price of an order in cents
   *
   * @param orderId Order id
   */
  async calculateOrderTotalPrice(orderId: string): Promise<number> {
    try {
      const query: { total_price: number }[] = await this.sequelize.query(
        `SELECT
          SUM(order_product.quantity * product.price) as total_price
        from
          order_product
        LEFT JOIN product ON
          product.id = order_product.product_id
        WHERE
          order_id = ?`,
        { replacements: [orderId], type: QueryTypes.SELECT }
      )

      let totalPrice: BigNumber | number = new BigNumber(query[0].total_price)

      totalPrice = totalPrice.times(100).toNumber()

      return totalPrice
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Cancel order and refund payment related to this order,
   * if it's a paid order
   *
   * @param order Order
   */
  async cancelOrder(order: OrderModel) {
    const t = await this.sequelize.transaction({ autocommit: false })

    try {
      // Throw error if order is already canceled
      if (order.getDataValue('status') === 'canceled') {
        throw new ValidationError({
          detail: 'Order is already canceled',
        })
      }

      const payment = await order.getPayment({
        where: { status: 'succeeded' },
        transaction: t,
      })

      // If order is paid, refund the payment
      if (payment) {
        await this.paymentService.refundStripePayment(
          payment.getDataValue('vendor_id')
        )

        await payment.update({ status: 'canceled' }, { transaction: t })
      }

      // Cancel order
      await order.update({ status: 'canceled' }, { transaction: t })

      // Increase stock of the products in the canceled order
      const orderProducts = await this.orderProductModel.findAll({
        where: { order_id: order.getDataValue('id') },
        include: [
          {
            model: this.productModel,
            attributes: ['id', 'stock', 'supplier_id', 'price'],
            include: [{ model: this.supplierModel }],
          },
        ],
        transaction: t,
      })

      for (let i = 0; i < orderProducts.length; i++) {
        await orderProducts[i].Product.increment(
          {
            stock: orderProducts[i].getDataValue('quantity'),
          },
          { transaction: t }
        )

        // If order is paid
        // Decrease Supplier balance
        if (payment) {
          const totalPricePerProduct = new BigNumber(
            orderProducts[i].Product.getDataValue('price')
          )

          const increasedBalance = totalPricePerProduct
            .times(orderProducts[i].getDataValue('quantity'))
            .toNumber()

          await orderProducts[i].Product.Supplier.decrement(
            {
              balance: increasedBalance,
            },
            { transaction: t }
          )
        }
      }

      await t.commit()
    } catch (e) {
      await t.rollback()
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Find and count order products
   *
   * @param orderId Order id
   * @param options Query options
   * @returns Order products
   */
  async findOrderProducts(
    orderId: string,
    options: FindOptions
  ): Promise<{ instances: Product[]; count: number }> {
    try {
      const order = await this.findByPK(orderId, {
        include: { model: Product },
      })

      const [count, instances] = await Promise.all([
        order.countProducts(),
        order.getProducts(options),
      ])

      return { count, instances }
    } catch (e) {
      this.logger.error(e)
      throw e
    }
  }

  /**
   * Check if user ordered and received a product.
   *
   * @param userId User id
   * @param productId Product id
   * @returns Whether or not user bought this product
   */
  async didUserOrdered(userId: string, productId: string): Promise<boolean> {
    const userOrders = await this.model.findAll({
      attributes: ['id', 'user_id', 'status'],
      include: [
        {
          required: true,
          model: this.orderProductModel,
          attributes: ['order_id', 'product_id'],
          include: [
            {
              model: this.productModel,
              attributes: ['id'],
              where: { id: productId },
              required: true,
            },
          ],
        },
      ],
      where: {
        user_id: userId,
        status: 'received',
      },
    })

    if (userOrders.length > 0) return true

    return false
  }
}

export default OrderService
