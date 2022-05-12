'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.createTable('role_permission', {
      role_id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'role',
          },
          key: 'id',
        },
        onDelete: 'cascade',
      },
      permission_id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'permission',
          },
          key: 'id',
        },
        onDelete: 'cascade',
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
    return await queryInterface.dropTable('role_permission')
  },
}
