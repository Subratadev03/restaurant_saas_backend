'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ingredients', {
      id:                  { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      restaurant_id:       { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurant_accounts', key: 'id' }, onDelete: 'CASCADE' },
      name:                { type: Sequelize.STRING(200), allowNull: false },
      sku:                 { type: Sequelize.STRING(100), allowNull: true },
      unit:                { type: Sequelize.ENUM('kg', 'g', 'l', 'ml', 'pcs', 'dozen'), defaultValue: 'pcs' },
      category:            { type: Sequelize.STRING(100), allowNull: true },
      low_stock_threshold: { type: Sequelize.DECIMAL(10, 3), defaultValue: 10 },
      cost_per_unit:       { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      is_active:           { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:          { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:          { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('ingredients', ['restaurant_id']);
    await queryInterface.addIndex('ingredients', ['restaurant_id', 'name'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('ingredients');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_ingredients_unit;');
  },
};
