import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const Recipe = sequelize.define('Recipe', {
  id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurantId:     { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
  menuItemId:       { type: DataTypes.UUID, allowNull: false, field: 'menu_item_id' },
  menuItemName:     { type: DataTypes.STRING(200), allowNull: false, field: 'menu_item_name' },
  ingredientId:     { type: DataTypes.UUID, allowNull: false, field: 'ingredient_id' },
  quantityRequired: { type: DataTypes.DECIMAL(10, 3), allowNull: false, field: 'quantity_required' },
  isActive:         { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
}, {
  tableName: 'recipes',
  underscored: true,
  timestamps: true,
  indexes: [{ fields: ['restaurant_id', 'menu_item_id'] }, { fields: ['ingredient_id'] }],
});

export default Recipe;
