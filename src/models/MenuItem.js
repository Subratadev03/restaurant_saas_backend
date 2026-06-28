import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const MenuItem = sequelize.define('MenuItem', {
  id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurantId:    { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
  name:            { type: DataTypes.STRING(200), allowNull: false },
  description:     { type: DataTypes.TEXT, allowNull: true },
  category:        { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'Uncategorized' },
  price:           { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  imageUrl:        { type: DataTypes.TEXT, allowNull: true, field: 'image_url' },
  isAvailable:     { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_available' },
  isVeg:           { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_veg' },
  preparationTime: { type: DataTypes.INTEGER, allowNull: true, field: 'preparation_time' },
  calories:        { type: DataTypes.INTEGER, allowNull: true },
  tags:            { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [], allowNull: true },
  sortOrder:       { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
}, {
  tableName: 'menu_items',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['restaurant_id'] },
    { fields: ['category'] },
    { fields: ['is_available'] },
  ],
});

export default MenuItem;
