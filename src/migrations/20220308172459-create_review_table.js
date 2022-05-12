'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('review', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        unique: 'unique_user_product_review',
        references: {
          model: {
            tableName: 'user',
          },
          key: 'id',
        },
      },
      product_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        unique: 'unique_user_product_review',
        references: {
          model: {
            tableName: 'product',
          },
          key: 'id',
        },
      },
      content: {
        type: Sequelize.TEXT('medium'),
      },
      rate: {
        type: Sequelize.INTEGER,
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

    await queryInterface.addConstraint('review', {
      fields: ['user_id', 'product_id'],
      type: 'unique',
      name: 'unique_user_product_review',
    })
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.dropTable('review')
  },
}
