import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const Ingredient = sequelize.define('Ingredient', {
  id:                 { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurantId:       { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
  name:               { type: DataTypes.STRING(200), allowNull: false },
  sku:                { type: DataTypes.STRING(100), allowNull: true },
  unit:               { type: DataTypes.ENUM('kg', 'g', 'l', 'ml', 'pcs', 'dozen'), defaultValue: 'pcs' },
  category:           { type: DataTypes.STRING(100), allowNull: true },
  lowStockThreshold:  { type: DataTypes.DECIMAL(10, 3), defaultValue: 10, field: 'low_stock_threshold' },
  costPerUnit:        { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'cost_per_unit' },
  isActive:           { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
}, {
  tableName: 'ingredients',
  underscored: true,
  timestamps: true,
  indexes: [{ fields: ['restaurant_id'] }, { unique: true, fields: ['restaurant_id', 'name'] }],
});

export default Ingredient;
