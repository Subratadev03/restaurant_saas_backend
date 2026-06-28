'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menu_items', {
      id:               { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      restaurant_id:    { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurant_accounts', key: 'id' }, onDelete: 'CASCADE' },
      name:             { type: Sequelize.STRING(200), allowNull: false },
      description:      { type: Sequelize.TEXT, allowNull: true },
      category:         { type: Sequelize.STRING(100), allowNull: false, defaultValue: 'Uncategorized' },
      price:            { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      image_url:        { type: Sequelize.TEXT, allowNull: true },
      is_available:     { type: Sequelize.BOOLEAN, defaultValue: true },
      is_veg:           { type: Sequelize.BOOLEAN, defaultValue: false },
      preparation_time: { type: Sequelize.INTEGER, allowNull: true },
      calories:         { type: Sequelize.INTEGER, allowNull: true },
      tags:             { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true },
      sort_order:       { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('menu_items', ['restaurant_id']);
    await queryInterface.addIndex('menu_items', ['category']);
  },
  async down(queryInterface) { await queryInterface.dropTable('menu_items'); },
};
