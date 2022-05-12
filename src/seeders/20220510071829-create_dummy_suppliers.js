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
     *
     */
    await queryInterface.bulkInsert('supplier', [
      {
        user_id: 1,
        name: 'Indomie',
        email: 'info@indomie.com.eg',
        phone_number: '+201061111194',
        country: 'Egypt',
        region: 'New York',
        address: 'Badr city area 250 fedan lot no. 150 – 153 Cairo',
        balance: 0,
      },
      {
        user_id: 2,
        name: 'Pepsi',
        email: 'PepsiCoDMKSG@pepsico.com',
        phone_number: '+639171234567',
        country: 'USA',
        region: 'New York',
        address: '700 Anderson Hill Rd, Purchase, NY 10577',
        balance: 0,
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
    await queryInterface.bulkDelete('supplier', null, {})
  },
}
