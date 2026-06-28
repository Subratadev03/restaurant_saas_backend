'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('restaurant_accounts', {
      id:                { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      name:              { type: Sequelize.STRING(200), allowNull: false },
      slug:              { type: Sequelize.STRING(100), allowNull: false, unique: true },
      email:             { type: Sequelize.STRING(255), allowNull: false, unique: true },
      phone:             { type: Sequelize.STRING(20), allowNull: true },
      address:           { type: Sequelize.TEXT, allowNull: true },
      city:              { type: Sequelize.STRING(100), allowNull: true },
      country:           { type: Sequelize.STRING(100), defaultValue: 'IN' },
      logo:              { type: Sequelize.TEXT, allowNull: true },
      timezone:          { type: Sequelize.STRING(50), defaultValue: 'Asia/Kolkata' },
      currency:          { type: Sequelize.STRING(10), defaultValue: 'INR' },
      settings:          { type: Sequelize.JSONB, defaultValue: '{"posEnabled":true,"onlineOrderingEnabled":false,"loyaltyEnabled":false,"taxRate":5,"serviceCharge":0}' },
      status:            { type: Sequelize.ENUM('active', 'suspended', 'trial'), defaultValue: 'trial' },
      trial_ends_at:     { type: Sequelize.DATE, allowNull: true },
      subscription_plan: { type: Sequelize.ENUM('trial', 'starter', 'pro', 'enterprise'), defaultValue: 'trial' },
      created_at:        { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at:        { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('restaurant_accounts', ['slug']);
    await queryInterface.addIndex('restaurant_accounts', ['status']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('restaurant_accounts');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_restaurant_accounts_status; DROP TYPE IF EXISTS enum_restaurant_accounts_subscription_plan;');
  },
};
