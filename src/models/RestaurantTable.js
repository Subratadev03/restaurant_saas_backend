import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const TABLE_TYPES = ['standard', 'sweet_spot', 'best_view', 'private', 'outdoor', 'bar', 'vip', 'family'];

const RestaurantTable = sequelize.define('RestaurantTable', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
  tableNumber:  { type: DataTypes.STRING(20), allowNull: false, field: 'table_number' },
  tableName:    { type: DataTypes.STRING(100), allowNull: true, field: 'table_name' },
  tableType: {
    type: DataTypes.ENUM(...TABLE_TYPES),
    defaultValue: 'standard',
    field: 'table_type',
  },
  capacity:     { type: DataTypes.INTEGER, defaultValue: 4 },
  status: {
    type: DataTypes.ENUM('available', 'occupied', 'reserved', 'inactive'),
    defaultValue: 'available',
  },
  floor:        { type: DataTypes.STRING(50), allowNull: true },
  description:  { type: DataTypes.TEXT, allowNull: true },
  features:     { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [], allowNull: true },
  isActive:     { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
}, {
  tableName: 'restaurant_tables',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['restaurant_id'] },
    { unique: true, fields: ['restaurant_id', 'table_number'] },
  ],
});

export default RestaurantTable;
