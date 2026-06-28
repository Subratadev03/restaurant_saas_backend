import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const Invoice = sequelize.define('Invoice', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurantId:   { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
  orderId:        { type: DataTypes.UUID, allowNull: false, field: 'order_id' },
  customerId:     { type: DataTypes.UUID, allowNull: true, field: 'customer_id' },
  invoiceNumber:  { type: DataTypes.STRING(30), allowNull: false, field: 'invoice_number' },
  subtotal:       { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  taxBreakdown:   { type: DataTypes.JSONB, defaultValue: [], field: 'tax_breakdown' },
  taxTotal:       { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'tax_total' },
  discountCode:   { type: DataTypes.STRING(50), allowNull: true, field: 'discount_code' },
  discountAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'discount_amount' },
  serviceCharge:  { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'service_charge' },
  grandTotal:     { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'grand_total' },
  paymentMethod:  { type: DataTypes.ENUM('cash', 'card', 'upi', 'wallet', 'online', 'split'), allowNull: true, field: 'payment_method' },
  status:         { type: DataTypes.ENUM('draft', 'issued', 'paid', 'cancelled', 'refunded'), defaultValue: 'draft' },
  notes:          { type: DataTypes.TEXT, allowNull: true },
  issuedAt:       { type: DataTypes.DATE, allowNull: true, field: 'issued_at' },
}, {
  tableName: 'invoices',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['restaurant_id'] },
    { fields: ['order_id'] },
    { fields: ['status'] },
    { unique: true, fields: ['restaurant_id', 'invoice_number'] },
  ],
});

export default Invoice;
