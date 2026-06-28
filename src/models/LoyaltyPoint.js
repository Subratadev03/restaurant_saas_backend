import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const LoyaltyPoint = sequelize.define('LoyaltyPoint', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  customerId:  { type: DataTypes.UUID, allowNull: false, field: 'customer_id' },
  restaurantId:{ type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
  type:        { type: DataTypes.ENUM('earned', 'redeemed', 'expired', 'adjusted'), allowNull: false },
  points:      { type: DataTypes.INTEGER, allowNull: false },
  orderId:     { type: DataTypes.UUID, allowNull: true, field: 'order_id' },
  description: { type: DataTypes.STRING(255), allowNull: true },
  expiresAt:   { type: DataTypes.DATE, allowNull: true, field: 'expires_at' },
}, {
  tableName: 'loyalty_points',
  underscored: true,
  timestamps: true,
  indexes: [{ fields: ['customer_id'] }, { fields: ['restaurant_id'] }],
});

export default LoyaltyPoint;
