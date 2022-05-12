'use strict'

module.exports = {
  generateRolePermissionAssociationObjects(role_id, permissions_ids) {
    const associationObjects = []

    permissions_ids.forEach((id) => {
      associationObjects.push({ role_id: role_id, permission_id: id })
    })

    return associationObjects
  },

  async up(queryInterface, Sequelize) {
    const defaultUserPermissions =
      this.generateRolePermissionAssociationObjects(
        2,
        [
          2, 4, 6, 10, 16, 18, 20, 22, 24, 27, 29, 44, 50, 51, 53, 55, 57, 59,
          66, 64,
        ]
      )

    return await queryInterface.bulkInsert('role_permission', [
      {
        role_id: 1,
        permission_id: 1,
      },
      ...defaultUserPermissions,
    ])
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.bulkDelete('role_permission', null, {})
  },
}
