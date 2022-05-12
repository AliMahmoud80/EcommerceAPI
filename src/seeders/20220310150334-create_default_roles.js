'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.bulkInsert('role', [
      {
        id: 1,
        name: 'admin',
      },
      {
        id: 2,
        name: 'default',
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.bulkDelete('role', null, {})
  },
}
