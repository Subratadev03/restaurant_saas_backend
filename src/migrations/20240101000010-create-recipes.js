'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recipes', {
      id:                { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      restaurant_id:     { type: Sequelize.UUID, allowNull: false },
      menu_item_id:      { type: Sequelize.UUID, allowNull: false },
      menu_item_name:    { type: Sequelize.STRING(200), allowNull: false },
      ingredient_id:     { type: Sequelize.UUID, allowNull: false, references: { model: 'ingredients', key: 'id' }, onDelete: 'CASCADE' },
      quantity_required: { type: Sequelize.DECIMAL(10, 3), allowNull: false },
      is_active:         { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:        { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:        { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('recipes', ['restaurant_id', 'menu_item_id']);
    await queryInterface.addIndex('recipes', ['ingredient_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('recipes'); },
};
