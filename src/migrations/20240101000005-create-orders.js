'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id:               { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      restaurant_id:    { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurant_accounts', key: 'id' }, onDelete: 'CASCADE' },
      customer_id:      { type: Sequelize.UUID, allowNull: true, references: { model: 'customers', key: 'id' }, onDelete: 'SET NULL' },
      order_number:     { type: Sequelize.STRING(20), allowNull: false },
      type:             { type: Sequelize.ENUM('dine_in', 'takeaway', 'delivery', 'online'), defaultValue: 'dine_in' },
      status:           { type: Sequelize.ENUM('received', 'preparing', 'ready', 'delivered', 'cancelled'), defaultValue: 'received' },
      table_number:     { type: Sequelize.STRING(20), allowNull: true },
      subtotal:         { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      tax_amount:       { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      discount_amount:  { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      total_amount:     { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      notes:            { type: Sequelize.TEXT, allowNull: true },
      delivery_address: { type: Sequelize.JSONB, allowNull: true },
      cancelled_reason: { type: Sequelize.TEXT, allowNull: true },
      completed_at:     { type: Sequelize.DATE, allowNull: true },
      created_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('orders', ['restaurant_id']);
    await queryInterface.addIndex('orders', ['status']);
    await queryInterface.addIndex('orders', ['customer_id']);
    await queryInterface.addIndex('orders', ['restaurant_id', 'order_number'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('orders');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_orders_type; DROP TYPE IF EXISTS enum_orders_status;');
  },
};
