import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const Role = sequelize.define('Role', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:        { type: DataTypes.STRING(50), allowNull: false },
  displayName: { type: DataTypes.STRING(100), allowNull: false, field: 'display_name' },
  permissions: { type: DataTypes.JSONB, defaultValue: {} },
  isSystem:    { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_system' },
}, { tableName: 'roles', underscored: true, timestamps: true });

export default Role;
