'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert('order', [
      {
        id: 1,
        user_id: 2,
        status: 'pending',
      },
      {
        id: 2,
        user_id: 3,
        status: 'pending',
      },
    ])

    await queryInterface.bulkInsert('order_product', [
      {
        id: 1,
        order_id: 1,
        product_id: 1,
        quantity: 20,
      },
      {
        id: 2,
        order_id: 1,
        product_id: 2,
        quantity: 50,
      },
      {
        id: 3,
        order_id: 2,
        product_id: 1,
        quantity: 150,
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('order', null, {})
    await queryInterface.bulkDelete('order_product', null, {})
  },
}
