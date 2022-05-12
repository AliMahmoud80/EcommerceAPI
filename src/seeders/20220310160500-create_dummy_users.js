'use strict'
import { hashPassword } from '@/services/utils'

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.bulkInsert('user', [
      {
        first_name: 'User',
        last_name: 'One',
        email: 'user@ecommerce.com',
        password: hashPassword('password'),
        phone_number: '+201229353048',
        country: 'Egypt',
        region: 'Alexandria',
        address: 'Grove street',
        role_id: 2,
      },
      {
        first_name: 'User',
        last_name: 'Two',
        email: 'user2@ecommerce.com',
        password: hashPassword('password'),
        phone_number: '+201229353049',
        country: 'Egypt',
        region: 'Cairo',
        address: 'Grovee street',
        role_id: 2,
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.bulkDelete('user', null, {})
  },
}
