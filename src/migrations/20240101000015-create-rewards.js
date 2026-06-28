'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rewards', {
      id:             { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      restaurant_id:  { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurant_accounts', key: 'id' }, onDelete: 'CASCADE' },
      name:           { type: Sequelize.STRING(200), allowNull: false },
      description:    { type: Sequelize.TEXT, allowNull: true },
      points_cost:    { type: Sequelize.INTEGER, allowNull: false },
      reward_type:    { type: Sequelize.ENUM('discount_flat', 'discount_percentage', 'free_item', 'custom'), allowNull: false },
      reward_value:   { type: Sequelize.JSONB, allowNull: true },
      stock:          { type: Sequelize.INTEGER, allowNull: true },
      redeemed_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      valid_until:    { type: Sequelize.DATE, allowNull: true },
      is_active:      { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:     { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:     { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('rewards', ['restaurant_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('rewards');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_rewards_reward_type;');
  },
};
