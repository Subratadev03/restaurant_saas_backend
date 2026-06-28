import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const PaymentTransaction = sequelize.define('PaymentTransaction', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderId:        { type: DataTypes.UUID, allowNull: false, field: 'order_id' },
  restaurantId:   { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
  method:         { type: DataTypes.ENUM('cash', 'card', 'upi', 'wallet', 'online'), allowNull: false },
  status:         { type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'), defaultValue: 'pending' },
  amount:         { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency:       { type: DataTypes.STRING(10), defaultValue: 'INR' },
  transactionRef: { type: DataTypes.STRING(255), allowNull: true, field: 'transaction_ref' },
  gatewayResponse:{ type: DataTypes.JSONB, allowNull: true, field: 'gateway_response' },
  paidAt:         { type: DataTypes.DATE, allowNull: true, field: 'paid_at' },
}, {
  tableName: 'payment_transactions',
  underscored: true,
  timestamps: true,
  indexes: [{ fields: ['order_id'] }, { fields: ['restaurant_id'] }, { fields: ['status'] }],
});

export default PaymentTransaction;
