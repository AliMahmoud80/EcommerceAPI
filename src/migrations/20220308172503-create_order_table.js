'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.createTable('order', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'user',
          },
          key: 'id',
        },
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'canceled',
          'confirmed',
          'shipping',
          'received'
        ),
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: false,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.dropTable('order')
  },
}
