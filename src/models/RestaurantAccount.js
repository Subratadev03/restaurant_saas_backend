import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const RestaurantAccount = sequelize.define('RestaurantAccount', {
  id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:             { type: DataTypes.STRING(200), allowNull: false },
  slug:             { type: DataTypes.STRING(100), allowNull: false, unique: true },
  email:            { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
  phone:            { type: DataTypes.STRING(20), allowNull: true },
  address:          { type: DataTypes.TEXT, allowNull: true },
  city:             { type: DataTypes.STRING(100), allowNull: true },
  country:          { type: DataTypes.STRING(100), defaultValue: 'IN' },
  logo:             { type: DataTypes.TEXT, allowNull: true },
  timezone:         { type: DataTypes.STRING(50), defaultValue: 'Asia/Kolkata' },
  currency:         { type: DataTypes.STRING(10), defaultValue: 'INR' },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      posEnabled: true,
      onlineOrderingEnabled: false,
      loyaltyEnabled: false,
      taxRate: 5,
      serviceCharge: 0,
    },
  },
  status:           { type: DataTypes.ENUM('active', 'suspended', 'trial'), defaultValue: 'trial' },
  trialEndsAt:      { type: DataTypes.DATE, allowNull: true, field: 'trial_ends_at' },
  subscriptionPlan: { type: DataTypes.ENUM('trial', 'starter', 'pro', 'enterprise'), defaultValue: 'trial', field: 'subscription_plan' },
}, {
  tableName: 'restaurant_accounts',
  underscored: true,
  timestamps: true,
  indexes: [{ fields: ['slug'] }, { fields: ['email'] }, { fields: ['status'] }],
});

export default RestaurantAccount;
