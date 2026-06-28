'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_items', {
      id:             { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      order_id:       { type: Sequelize.UUID, allowNull: false, references: { model: 'orders', key: 'id' }, onDelete: 'CASCADE' },
      menu_item_id:   { type: Sequelize.UUID, allowNull: false },
      menu_item_name: { type: Sequelize.STRING(200), allowNull: false },
      quantity:       { type: Sequelize.INTEGER, defaultValue: 1 },
      unit_price:     { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      total_price:    { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      modifiers:      { type: Sequelize.JSONB, defaultValue: '[]' },
      notes:          { type: Sequelize.TEXT, allowNull: true },
      status:         { type: Sequelize.ENUM('pending', 'preparing', 'ready', 'served', 'cancelled'), defaultValue: 'pending' },
      created_at:     { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:     { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('order_items', ['order_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('order_items');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_order_items_status;');
  },
};
