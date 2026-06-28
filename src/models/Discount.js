import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const Discount = sequelize.define('Discount', {
  id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurantId:     { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
  name:             { type: DataTypes.STRING(100), allowNull: false },
  code:             { type: DataTypes.STRING(50), allowNull: true },
  type:             { type: DataTypes.ENUM('percentage', 'flat'), defaultValue: 'percentage' },
  value:            { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  minOrderAmount:   { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'min_order_amount' },
  maxDiscountAmount:{ type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'max_discount_amount' },
  usageLimit:       { type: DataTypes.INTEGER, allowNull: true, field: 'usage_limit' },
  usedCount:        { type: DataTypes.INTEGER, defaultValue: 0, field: 'used_count' },
  validFrom:        { type: DataTypes.DATE, allowNull: true, field: 'valid_from' },
  validUntil:       { type: DataTypes.DATE, allowNull: true, field: 'valid_until' },
  isActive:         { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
}, {
  tableName: 'discounts',
  underscored: true,
  timestamps: true,
  indexes: [{ fields: ['restaurant_id'] }, { fields: ['code'] }],
});

export default Discount;
