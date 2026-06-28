import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const Reward = sequelize.define('Reward', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurantId:  { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
  name:          { type: DataTypes.STRING(200), allowNull: false },
  description:   { type: DataTypes.TEXT, allowNull: true },
  pointsCost:    { type: DataTypes.INTEGER, allowNull: false, field: 'points_cost' },
  rewardType:    { type: DataTypes.ENUM('discount_flat', 'discount_percentage', 'free_item', 'custom'), allowNull: false, field: 'reward_type' },
  rewardValue:   { type: DataTypes.JSONB, allowNull: true, field: 'reward_value' },
  stock:         { type: DataTypes.INTEGER, allowNull: true },
  redeemedCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'redeemed_count' },
  validUntil:    { type: DataTypes.DATE, allowNull: true, field: 'valid_until' },
  isActive:      { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
}, {
  tableName: 'rewards',
  underscored: true,
  timestamps: true,
  indexes: [{ fields: ['restaurant_id'] }],
});

export default Reward;
