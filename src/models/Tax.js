import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const Tax = sequelize.define('Tax', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurantId:{ type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
  name:        { type: DataTypes.STRING(100), allowNull: false },
  rate:        { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  isInclusive: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_inclusive' },
  isActive:    { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
}, {
  tableName: 'taxes',
  underscored: true,
  timestamps: true,
  indexes: [{ fields: ['restaurant_id'] }],
});

export default Tax;
