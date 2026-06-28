'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id:                 { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      restaurant_id:      { type: Sequelize.UUID, allowNull: true, references: { model: 'restaurant_accounts', key: 'id' }, onDelete: 'CASCADE' },
      role_id:            { type: Sequelize.UUID, allowNull: false, references: { model: 'roles', key: 'id' }, onDelete: 'RESTRICT' },
      first_name:         { type: Sequelize.STRING(100), allowNull: false },
      last_name:          { type: Sequelize.STRING(100), allowNull: true },
      email:              { type: Sequelize.STRING(255), allowNull: false, unique: true },
      phone:              { type: Sequelize.STRING(20), allowNull: true },
      password_hash:      { type: Sequelize.STRING(255), allowNull: false },
      is_active:          { type: Sequelize.BOOLEAN, defaultValue: true },
      last_login_at:      { type: Sequelize.DATE, allowNull: true },
      refresh_token_hash: { type: Sequelize.STRING(255), allowNull: true },
      avatar_url:         { type: Sequelize.TEXT, allowNull: true },
      created_at:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['restaurant_id']);
  },
  async down(queryInterface) { await queryInterface.dropTable('users'); },
};
