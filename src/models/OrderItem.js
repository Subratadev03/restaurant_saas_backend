import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const OrderItem = sequelize.define('OrderItem', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderId:      { type: DataTypes.UUID, allowNull: false, field: 'order_id' },
  menuItemId:   { type: DataTypes.UUID, allowNull: false, field: 'menu_item_id' },
  menuItemName: { type: DataTypes.STRING(200), allowNull: false, field: 'menu_item_name' },
  quantity:     { type: DataTypes.INTEGER, defaultValue: 1 },
  unitPrice:    { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'unit_price' },
  totalPrice:   { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'total_price' },
  modifiers:    { type: DataTypes.JSONB, defaultValue: [] },
  notes:        { type: DataTypes.TEXT, allowNull: true },
  status:       { type: DataTypes.ENUM('pending', 'preparing', 'ready', 'served', 'cancelled'), defaultValue: 'pending' },
}, {
  tableName: 'order_items',
  underscored: true,
  timestamps: true,
  indexes: [{ fields: ['order_id'] }, { fields: ['menu_item_id'] }],
});

export default OrderItem;
