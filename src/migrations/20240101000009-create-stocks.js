'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stocks', {
      id:               { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      ingredient_id:    { type: Sequelize.UUID, allowNull: false, references: { model: 'ingredients', key: 'id' }, onDelete: 'CASCADE' },
      restaurant_id:    { type: Sequelize.UUID, allowNull: false },
      quantity:         { type: Sequelize.DECIMAL(10, 3), defaultValue: 0 },
      reserved_quantity:{ type: Sequelize.DECIMAL(10, 3), defaultValue: 0 },
      last_restocked_at:{ type: Sequelize.DATE, allowNull: true },
      created_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('stocks', ['ingredient_id', 'restaurant_id'], { unique: true });
    await queryInterface.addIndex('stocks', ['restaurant_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('stocks'); },
};
