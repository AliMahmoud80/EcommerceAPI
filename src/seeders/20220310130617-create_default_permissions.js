'use strict'

module.exports = {
  /**
   * Create a combination of all possible permissions
   */
  generateStandardPermissions() {
    const entities = [
      'user',
      'product',
      'order',
      'review',
      'role',
      'permission',
      'payment',
      'medium',
      'supplier',
      'category',
      'sale',
    ]
    const actions = ['read', 'update', 'delete', 'create']
    const extras = ['own', 'all']
    const permissions = []

    entities.forEach((entity) => {
      actions.forEach((action) => {
        extras.forEach((extra) => {
          if (action === 'create') {
            const alreadyExists = permissions.find(
              (o) => o.name === `${action}:${entity}`
            )

            if (!alreadyExists)
              permissions.push({ name: `${action}:${entity}` })

            return
          }

          permissions.push({ name: `${action}:${entity}:${extra}` })
        })
      })
    })

    return permissions
  },

  async up(queryInterface, Sequelize) {
    const standardPermissions = this.generateStandardPermissions()

    return await queryInterface.bulkInsert('permission', [
      {
        id: 1,
        name: 'manage:all',
      },
      // {
      //   name: 'read:user:all',
      // },
      ...standardPermissions,
      {
        name: 'set:user_role:all',
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.bulkDelete('permission', null, {})
  },
}
