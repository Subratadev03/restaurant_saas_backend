'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_transactions', {
      id:               { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      order_id:         { type: Sequelize.UUID, allowNull: false, references: { model: 'orders', key: 'id' }, onDelete: 'CASCADE' },
      restaurant_id:    { type: Sequelize.UUID, allowNull: false },
      method:           { type: Sequelize.ENUM('cash', 'card', 'upi', 'wallet', 'online'), allowNull: false },
      status:           { type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'), defaultValue: 'pending' },
      amount:           { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency:         { type: Sequelize.STRING(10), defaultValue: 'INR' },
      transaction_ref:  { type: Sequelize.STRING(255), allowNull: true },
      gateway_response: { type: Sequelize.JSONB, allowNull: true },
      paid_at:          { type: Sequelize.DATE, allowNull: true },
      created_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('payment_transactions', ['order_id']);
    await queryInterface.addIndex('payment_transactions', ['restaurant_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('payment_transactions');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_payment_transactions_method; DROP TYPE IF EXISTS enum_payment_transactions_status;');
  },
};
