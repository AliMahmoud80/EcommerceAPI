'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.createTable('payment', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: {
            tableName: 'user',
          },
          key: 'id',
        },
      },
      order_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: {
            tableName: 'order',
          },
          key: 'id',
        },
      },
      method: {
        type: Sequelize.STRING,
      },
      amount: {
        type: Sequelize.DOUBLE,
      },
      currency: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      vendor_id: {
        type: Sequelize.STRING,
      },
      vendor_data: {
        type: Sequelize.JSON,
        allowNull: true,
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
    return await queryInterface.dropTable('payment')
  },
}
