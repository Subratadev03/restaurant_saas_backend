/**
 * Single models entry-point.
 * Import from here everywhere — ensures models are registered once
 * and all Sequelize associations are set up correctly.
 */
import { getSequelize } from '../config/sequelize.js';

import Role               from './Role.js';
import RestaurantAccount  from './RestaurantAccount.js';
import User               from './User.js';
import Order              from './Order.js';
import OrderItem          from './OrderItem.js';
import PaymentTransaction from './PaymentTransaction.js';
import Ingredient         from './Ingredient.js';
import Stock              from './Stock.js';
import Recipe             from './Recipe.js';
import Tax                from './Tax.js';
import Discount           from './Discount.js';
import Invoice            from './Invoice.js';
import Customer           from './Customer.js';
import MenuItem        from './MenuItem.js';
import RestaurantTable from './RestaurantTable.js';
import Reservation     from './Reservation.js';
import LoyaltyPoint    from './LoyaltyPoint.js';
import Reward             from './Reward.js';

// ── Auth associations ────────────────────────────────────────────────────────
User.belongsTo(Role,              { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User,                { foreignKey: 'roleId', as: 'users' });

User.belongsTo(RestaurantAccount, { foreignKey: 'restaurantId', as: 'restaurant' });
RestaurantAccount.hasMany(User,   { foreignKey: 'restaurantId', as: 'staff' });

// ── Order associations ───────────────────────────────────────────────────────
Order.belongsTo(RestaurantAccount, { foreignKey: 'restaurantId', as: 'restaurant' });
Order.belongsTo(Customer,          { foreignKey: 'customerId', as: 'customer' });
Order.hasMany(OrderItem,           { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
Order.hasMany(PaymentTransaction,  { foreignKey: 'orderId', as: 'payments' });

OrderItem.belongsTo(Order,         { foreignKey: 'orderId', as: 'order' });
PaymentTransaction.belongsTo(Order,{ foreignKey: 'orderId', as: 'order' });

// ── Inventory associations ───────────────────────────────────────────────────
Ingredient.hasOne(Stock,           { foreignKey: 'ingredientId', as: 'stock', onDelete: 'CASCADE' });
Stock.belongsTo(Ingredient,        { foreignKey: 'ingredientId', as: 'ingredient' });

Ingredient.hasMany(Recipe,         { foreignKey: 'ingredientId', as: 'recipes' });
Recipe.belongsTo(Ingredient,       { foreignKey: 'ingredientId', as: 'ingredient' });

// ── POS associations ─────────────────────────────────────────────────────────
Invoice.belongsTo(Order,           { foreignKey: 'orderId', as: 'order' });
Order.hasOne(Invoice,              { foreignKey: 'orderId', as: 'invoice' });

// ── Table / Reservation associations ────────────────────────────────────────
RestaurantTable.belongsTo(RestaurantAccount, { foreignKey: 'restaurantId', as: 'restaurant' });
RestaurantAccount.hasMany(RestaurantTable,   { foreignKey: 'restaurantId', as: 'tables' });

Reservation.belongsTo(RestaurantTable, { foreignKey: 'tableId',      as: 'table' });
Reservation.belongsTo(Customer,        { foreignKey: 'customerId',   as: 'customer' });
RestaurantTable.hasMany(Reservation,   { foreignKey: 'tableId',      as: 'reservations' });

Order.belongsTo(RestaurantTable, { foreignKey: 'tableId', as: 'table' });
RestaurantTable.hasMany(Order,   { foreignKey: 'tableId', as: 'orders' });

// ── MenuItem / Recipe associations ──────────────────────────────────────────
MenuItem.belongsTo(RestaurantAccount, { foreignKey: 'restaurantId', as: 'restaurant' });
RestaurantAccount.hasMany(MenuItem,   { foreignKey: 'restaurantId', as: 'menuItems' });

MenuItem.hasMany(Recipe,  { foreignKey: 'menuItemId', as: 'recipe' });
Recipe.belongsTo(MenuItem,{ foreignKey: 'menuItemId', as: 'menuItem' });

// ── Customer / Loyalty associations ─────────────────────────────────────────
Customer.hasMany(LoyaltyPoint,     { foreignKey: 'customerId', as: 'loyaltyLedger' });
LoyaltyPoint.belongsTo(Customer,   { foreignKey: 'customerId', as: 'customer' });

Customer.hasMany(Order,            { foreignKey: 'customerId', as: 'orders' });

const sequelize = getSequelize();

export {
  sequelize,
  Role,
  RestaurantAccount,
  User,
  MenuItem,
  RestaurantTable,
  Reservation,
  Order,
  OrderItem,
  PaymentTransaction,
  Ingredient,
  Stock,
  Recipe,
  Tax,
  Discount,
  Invoice,
  Customer,
  LoyaltyPoint,
  Reward,
};
