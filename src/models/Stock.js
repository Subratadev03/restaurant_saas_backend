import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const Stock = sequelize.define('Stock', {
  id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  ingredientId:     { type: DataTypes.UUID, allowNull: false, field: 'ingredient_id' },
  restaurantId:     { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
  quantity:         { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
  reservedQuantity: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0, field: 'reserved_quantity' },
  lastRestockedAt:  { type: DataTypes.DATE, allowNull: true, field: 'last_restocked_at' },
}, {
  tableName: 'stocks',
  underscored: true,
  timestamps: true,
  indexes: [{ unique: true, fields: ['ingredient_id', 'restaurant_id'] }, { fields: ['restaurant_id'] }],
});

export default Stock;
