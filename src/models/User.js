import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { getSequelize } from '../config/sequelize.js';
const sequelize = getSequelize();

const User = sequelize.define('User', {
  id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurantId:     { type: DataTypes.UUID, allowNull: true,  field: 'restaurant_id' },
  roleId:           { type: DataTypes.UUID, allowNull: false, field: 'role_id' },
  firstName:        { type: DataTypes.STRING(100), allowNull: false, field: 'first_name' },
  lastName:         { type: DataTypes.STRING(100), allowNull: true,  field: 'last_name' },
  email:            { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
  phone:            { type: DataTypes.STRING(20),  allowNull: true },
  passwordHash:     { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
  isActive:         { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
  lastLoginAt:      { type: DataTypes.DATE, allowNull: true, field: 'last_login_at' },
  refreshTokenHash: { type: DataTypes.STRING(255), allowNull: true, field: 'refresh_token_hash' },
  avatarUrl:        { type: DataTypes.TEXT, allowNull: true, field: 'avatar_url' },
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  defaultScope: { attributes: { exclude: ['passwordHash', 'refreshTokenHash'] } },
  scopes: { withPassword: { attributes: {} } },
  indexes: [{ unique: true, fields: ['email'] }, { fields: ['restaurant_id'] }, { fields: ['role_id'] }],
});

User.prototype.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

User.prototype.toSafeObject = function () {
  const { passwordHash, refreshTokenHash, ...safe } = this.toJSON();
  return safe;
};

User.beforeCreate(async (user) => {
  if (user.passwordHash && !user.passwordHash.startsWith('$2')) {
    user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('passwordHash') && !user.passwordHash.startsWith('$2')) {
    user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
  }
});

export default User;
