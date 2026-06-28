'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id:           { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      name:         { type: Sequelize.STRING(50), allowNull: false },
      display_name: { type: Sequelize.STRING(100), allowNull: false },
      permissions:  { type: Sequelize.JSONB, defaultValue: '{}' },
      is_system:    { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('roles', ['name']);
  },
  async down(queryInterface) { await queryInterface.dropTable('roles'); },
};
