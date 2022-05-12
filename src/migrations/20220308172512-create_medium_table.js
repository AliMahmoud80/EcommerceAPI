'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.createTable('medium', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
      },
      s3_key: {
        type: Sequelize.TEXT(),
      },
      original_name: {
        type: Sequelize.STRING(255),
      },
      extension: {
        type: Sequelize.STRING(255),
      },
      size: {
        type: Sequelize.FLOAT,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: false,
      },
    })
  },

  async down(queryInterface) {
    return await queryInterface.dropTable('medium')
  },
}
