'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customers', {
      id:                { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      restaurant_id:     { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurant_accounts', key: 'id' }, onDelete: 'CASCADE' },
      first_name:        { type: Sequelize.STRING(100), allowNull: false },
      last_name:         { type: Sequelize.STRING(100), allowNull: true },
      email:             { type: Sequelize.STRING(255), allowNull: true },
      phone:             { type: Sequelize.STRING(20), allowNull: true },
      date_of_birth:     { type: Sequelize.DATEONLY, allowNull: true },
      gender:            { type: Sequelize.ENUM('male', 'female', 'other', 'prefer_not_to_say'), allowNull: true },
      total_orders:      { type: Sequelize.INTEGER, defaultValue: 0 },
      total_spent:       { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      last_order_at:     { type: Sequelize.DATE, allowNull: true },
      preferred_address: { type: Sequelize.JSONB, allowNull: true },
      tags:              { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true },
      is_active:         { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:        { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:        { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('customers', ['restaurant_id']);
    await queryInterface.addIndex('customers', ['email']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('customers');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_customers_gender;');
  },
};
