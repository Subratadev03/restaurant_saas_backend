'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('discounts', {
      id:                  { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      restaurant_id:       { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurant_accounts', key: 'id' }, onDelete: 'CASCADE' },
      name:                { type: Sequelize.STRING(100), allowNull: false },
      code:                { type: Sequelize.STRING(50), allowNull: true },
      type:                { type: Sequelize.ENUM('percentage', 'flat'), defaultValue: 'percentage' },
      value:               { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      min_order_amount:    { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      max_discount_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      usage_limit:         { type: Sequelize.INTEGER, allowNull: true },
      used_count:          { type: Sequelize.INTEGER, defaultValue: 0 },
      valid_from:          { type: Sequelize.DATE, allowNull: true },
      valid_until:         { type: Sequelize.DATE, allowNull: true },
      is_active:           { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:          { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:          { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('discounts', ['restaurant_id']);
    await queryInterface.addIndex('discounts', ['code']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('discounts');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_discounts_type;');
  },
};
