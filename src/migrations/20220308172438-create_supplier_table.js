'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.createTable('supplier', {
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
      name: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      phone_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      country: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT('medium'),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      balance: {
        type: Sequelize.DOUBLE,
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
    return await queryInterface.dropTable('supplier')
  },
}
