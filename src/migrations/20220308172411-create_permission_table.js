'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.createTable('permission', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        unique: true,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.dropTable('permission')
  },
}
