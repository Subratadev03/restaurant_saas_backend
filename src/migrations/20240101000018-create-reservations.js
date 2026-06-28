'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reservations', {
      id:               { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      restaurant_id:    { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurant_accounts', key: 'id' }, onDelete: 'CASCADE' },
      table_id:         { type: Sequelize.UUID, allowNull: false, references: { model: 'restaurant_tables', key: 'id' }, onDelete: 'CASCADE' },
      customer_id:      { type: Sequelize.UUID, allowNull: true,  references: { model: 'customers', key: 'id' }, onDelete: 'SET NULL' },
      guest_name:       { type: Sequelize.STRING(200), allowNull: false },
      guest_phone:      { type: Sequelize.STRING(20), allowNull: true },
      guest_email:      { type: Sequelize.STRING(255), allowNull: true },
      party_size:       { type: Sequelize.INTEGER, defaultValue: 1 },
      reservation_date: { type: Sequelize.DATEONLY, allowNull: false },
      start_time:       { type: Sequelize.STRING(10), allowNull: false },
      end_time:         { type: Sequelize.STRING(10), allowNull: true },
      status:           { type: Sequelize.ENUM('pending','confirmed','seated','completed','cancelled','no_show'), defaultValue: 'pending' },
      notes:            { type: Sequelize.TEXT, allowNull: true },
      special_requests: { type: Sequelize.TEXT, allowNull: true },
      created_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('reservations', ['restaurant_id']);
    await queryInterface.addIndex('reservations', ['table_id']);
    await queryInterface.addIndex('reservations', ['reservation_date']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('reservations');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_reservations_status;');
  },
};
