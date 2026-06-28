'use strict';
const { v4: uuidv4 } = require('uuid');

const roles = [
  { id: uuidv4(), name: 'super_admin',       display_name: 'Super Admin',       is_system: true, permissions: JSON.stringify({ restaurants: { read: true, write: true, delete: true }, users: { read: true, write: true } }), created_at: new Date(), updated_at: new Date() },
  { id: uuidv4(), name: 'restaurant_owner',  display_name: 'Restaurant Owner',  is_system: true, permissions: JSON.stringify({ orders: { read: true, write: true }, inventory: { read: true, write: true }, pos: { read: true, write: true }, customers: { read: true, write: true }, settings: { read: true, write: true } }), created_at: new Date(), updated_at: new Date() },
  { id: uuidv4(), name: 'manager',           display_name: 'Manager',           is_system: true, permissions: JSON.stringify({ orders: { read: true, write: true }, inventory: { read: true, write: true }, pos: { read: true, write: true }, reports: { read: true } }), created_at: new Date(), updated_at: new Date() },
  { id: uuidv4(), name: 'cashier',           display_name: 'Cashier',           is_system: true, permissions: JSON.stringify({ orders: { read: true, write: true }, pos: { read: true, write: true } }), created_at: new Date(), updated_at: new Date() },
  { id: uuidv4(), name: 'kitchen_staff',     display_name: 'Kitchen Staff',     is_system: true, permissions: JSON.stringify({ orders: { read: true, write: true }, inventory: { read: true } }), created_at: new Date(), updated_at: new Date() },
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('roles', roles);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', { is_system: true });
  },
};
