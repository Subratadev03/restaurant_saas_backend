'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'table_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'restaurant_tables', key: 'id' },
      onDelete: 'SET NULL',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('orders', 'table_id');
  },
};
