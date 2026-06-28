import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const Customer = sequelize.define('Customer', {
  id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurantId:     { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
  firstName:        { type: DataTypes.STRING(100), allowNull: false, field: 'first_name' },
  lastName:         { type: DataTypes.STRING(100), allowNull: true,  field: 'last_name' },
  email:            { type: DataTypes.STRING(255), allowNull: true, validate: { isEmail: true } },
  phone:            { type: DataTypes.STRING(20),  allowNull: true },
  dateOfBirth:      { type: DataTypes.DATEONLY, allowNull: true, field: 'date_of_birth' },
  gender:           { type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'), allowNull: true },
  totalOrders:      { type: DataTypes.INTEGER, defaultValue: 0, field: 'total_orders' },
  totalSpent:       { type: DataTypes.DECIMAL(12, 2), defaultValue: 0, field: 'total_spent' },
  lastOrderAt:      { type: DataTypes.DATE, allowNull: true, field: 'last_order_at' },
  preferredAddress: { type: DataTypes.JSONB, allowNull: true, field: 'preferred_address' },
  tags:             { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  isActive:         { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
}, {
  tableName: 'customers',
  underscored: true,
  timestamps: true,
  indexes: [{ fields: ['restaurant_id'] }, { fields: ['email'] }],
});

export default Customer;
