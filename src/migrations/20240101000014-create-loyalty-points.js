'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('loyalty_points', {
      id:           { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      customer_id:  { type: Sequelize.UUID, allowNull: false, references: { model: 'customers', key: 'id' }, onDelete: 'CASCADE' },
      restaurant_id:{ type: Sequelize.UUID, allowNull: false },
      type:         { type: Sequelize.ENUM('earned', 'redeemed', 'expired', 'adjusted'), allowNull: false },
      points:       { type: Sequelize.INTEGER, allowNull: false },
      order_id:     { type: Sequelize.UUID, allowNull: true },
      description:  { type: Sequelize.STRING(255), allowNull: true },
      expires_at:   { type: Sequelize.DATE, allowNull: true },
      created_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('loyalty_points', ['customer_id']);
    await queryInterface.addIndex('loyalty_points', ['restaurant_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('loyalty_points');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_loyalty_points_type;');
  },
};
