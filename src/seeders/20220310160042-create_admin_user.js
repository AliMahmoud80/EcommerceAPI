'use strict'
import { hashPassword } from '@/services/utils'

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.bulkInsert('user', [
      {
        id: 1,
        first_name: 'admin',
        last_name: 'admin',
        email: 'admin@ecommerce.com',
        password: hashPassword('password'),
        phone_number: '+201229353047',
        country: 'Britain',
        region: 'London',
        address: '221B baker street',
        role_id: 1,
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.bulkDelete('user', null, {})
  },
}
