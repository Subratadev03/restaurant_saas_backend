'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('taxes', {
      id:           { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      restaurant_id:{ type: Sequelize.UUID, allowNull: false, references: { model: 'restaurant_accounts', key: 'id' }, onDelete: 'CASCADE' },
      name:         { type: Sequelize.STRING(100), allowNull: false },
      rate:         { type: Sequelize.DECIMAL(5, 2), allowNull: false },
      is_inclusive: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_active:    { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('taxes', ['restaurant_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('taxes'); },
};
