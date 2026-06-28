import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const Order = sequelize.define('Order', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurantId:   { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
  customerId:     { type: DataTypes.UUID, allowNull: true,  field: 'customer_id' },
  orderNumber:    { type: DataTypes.STRING(20), allowNull: false, field: 'order_number' },
  type:           { type: DataTypes.ENUM('dine_in', 'takeaway', 'delivery', 'online'), defaultValue: 'dine_in' },
  status:         { type: DataTypes.ENUM('received', 'preparing', 'ready', 'delivered', 'cancelled'), defaultValue: 'received' },
  tableId:        { type: DataTypes.UUID, allowNull: true, field: 'table_id' },
  tableNumber:    { type: DataTypes.STRING(20), allowNull: true, field: 'table_number' },
  subtotal:       { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  taxAmount:      { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'tax_amount' },
  discountAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'discount_amount' },
  totalAmount:    { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'total_amount' },
  notes:          { type: DataTypes.TEXT, allowNull: true },
  deliveryAddress:  { type: DataTypes.JSONB, allowNull: true, field: 'delivery_address' },
  cancelledReason:  { type: DataTypes.TEXT, allowNull: true, field: 'cancelled_reason' },
  completedAt:      { type: DataTypes.DATE, allowNull: true, field: 'completed_at' },
}, {
  tableName: 'orders',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['restaurant_id'] },
    { fields: ['status'] },
    { fields: ['customer_id'] },
    { unique: true, fields: ['restaurant_id', 'order_number'] },
  ],
});

export default Order;
