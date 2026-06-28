'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('restaurant_tables', {
      id:           { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      restaurant_id:{ type: Sequelize.UUID, allowNull: false, references: { model: 'restaurant_accounts', key: 'id' }, onDelete: 'CASCADE' },
      table_number: { type: Sequelize.STRING(20), allowNull: false },
      table_name:   { type: Sequelize.STRING(100), allowNull: true },
      table_type:   { type: Sequelize.ENUM('standard','sweet_spot','best_view','private','outdoor','bar','vip','family'), defaultValue: 'standard' },
      capacity:     { type: Sequelize.INTEGER, defaultValue: 4 },
      status:       { type: Sequelize.ENUM('available','occupied','reserved','inactive'), defaultValue: 'available' },
      floor:        { type: Sequelize.STRING(50), allowNull: true },
      description:  { type: Sequelize.TEXT, allowNull: true },
      features:     { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true },
      is_active:    { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('restaurant_tables', ['restaurant_id']);
    await queryInterface.addIndex('restaurant_tables', ['restaurant_id', 'table_number'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('restaurant_tables');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_restaurant_tables_table_type; DROP TYPE IF EXISTS enum_restaurant_tables_status;');
  },
};
