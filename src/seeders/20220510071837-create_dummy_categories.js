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
    await queryInterface.bulkInsert('category', [
      {
        id: 1,
        name: 'Nutrition',
      },
      {
        id: 2,
        name: 'Food',
        parent_category_id: 1,
      },
      {
        id: 3,
        name: 'Drinks',
        parent_category_id: 1,
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
    await queryInterface.bulkDelete('category', null, {})
  },
}
