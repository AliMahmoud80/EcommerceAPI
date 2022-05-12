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
    await queryInterface.bulkInsert('product', [
      {
        id: 1,
        supplier_id: 1,
        category_id: 1,
        title: 'Indomie Beef Flavour',
        content:
          '<img src="https://indomie.com.eg/wp-content/uploads/2017/11/beef-1-300x221.png"/> <br> Who wants noodles',
        price: 0.22,
        stock: 1000,
        thumbnails: JSON.stringify([
          'https://indomie.com.eg/wp-content/uploads/2017/11/beef-1-300x221.png',
        ]),
      },
      {
        id: 2,
        supplier_id: 2,
        category_id: 2,
        title: 'PEPSI ZERO SUGAR',
        content:
          '<img src="https://www.pepsi.com/en-us/uploads/images/can-pepsi-zero-sugar.png"/> <br> Refreshing pepsi',
        price: 0.22,
        stock: 1000,
        thumbnails: JSON.stringify([
          'https://www.pepsi.com/en-us/uploads/images/can-pepsi-zero-sugar.png',
        ]),
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
    await queryInterface.bulkDelete('product', null, {})
  },
}
