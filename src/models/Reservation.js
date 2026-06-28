import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const Reservation = sequelize.define('Reservation', {
  id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurantId:    { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
  tableId:         { type: DataTypes.UUID, allowNull: false, field: 'table_id' },
  customerId:      { type: DataTypes.UUID, allowNull: true,  field: 'customer_id' },
  guestName:       { type: DataTypes.STRING(200), allowNull: false, field: 'guest_name' },
  guestPhone:      { type: DataTypes.STRING(20),  allowNull: true,  field: 'guest_phone' },
  guestEmail:      { type: DataTypes.STRING(255), allowNull: true,  field: 'guest_email' },
  partySize:       { type: DataTypes.INTEGER, defaultValue: 1, field: 'party_size' },
  reservationDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'reservation_date' },
  startTime:       { type: DataTypes.STRING(10), allowNull: false, field: 'start_time' },
  endTime:         { type: DataTypes.STRING(10), allowNull: true,  field: 'end_time' },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'),
    defaultValue: 'pending',
  },
  notes:           { type: DataTypes.TEXT, allowNull: true },
  specialRequests: { type: DataTypes.TEXT, allowNull: true, field: 'special_requests' },
}, {
  tableName: 'reservations',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['restaurant_id'] },
    { fields: ['table_id'] },
    { fields: ['reservation_date'] },
    { fields: ['status'] },
  ],
});

export default Reservation;
