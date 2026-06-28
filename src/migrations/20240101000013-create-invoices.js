'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invoices', {
      id:              { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      restaurant_id:   { type: Sequelize.UUID, allowNull: false },
      order_id:        { type: Sequelize.UUID, allowNull: false, references: { model: 'orders', key: 'id' }, onDelete: 'CASCADE' },
      customer_id:     { type: Sequelize.UUID, allowNull: true },
      invoice_number:  { type: Sequelize.STRING(30), allowNull: false },
      subtotal:        { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      tax_breakdown:   { type: Sequelize.JSONB, defaultValue: '[]' },
      tax_total:       { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      discount_code:   { type: Sequelize.STRING(50), allowNull: true },
      discount_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      service_charge:  { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      grand_total:     { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      payment_method:  { type: Sequelize.ENUM('cash', 'card', 'upi', 'wallet', 'online', 'split'), allowNull: true },
      status:          { type: Sequelize.ENUM('draft', 'issued', 'paid', 'cancelled', 'refunded'), defaultValue: 'draft' },
      notes:           { type: Sequelize.TEXT, allowNull: true },
      issued_at:       { type: Sequelize.DATE, allowNull: true },
      created_at:      { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:      { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('invoices', ['restaurant_id']);
    await queryInterface.addIndex('invoices', ['order_id']);
    await queryInterface.addIndex('invoices', ['restaurant_id', 'invoice_number'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('invoices');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_invoices_payment_method; DROP TYPE IF EXISTS enum_invoices_status;');
  },
};
