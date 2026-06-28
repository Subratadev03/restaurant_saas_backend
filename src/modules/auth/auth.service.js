import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, Role, RestaurantAccount } from '../../models/index.js';
import { createError } from '../../middleware/error.middleware.js';
import { logger } from '../../utils/logger.js';

function generateTokens(payload) {
  return {
    accessToken:  jwt.sign(payload, process.env.JWT_SECRET,         { expiresIn: process.env.JWT_EXPIRES_IN         || '15m' }),
    refreshToken: jwt.sign(payload, process.env.JWT_REFRESH_SECRET,  { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }),
  };
}

export class AuthService {
  static async registerRestaurant({ restaurantData, ownerData }) {
    const ownerRole = await Role.findOne({ where: { name: 'restaurant_owner' } });
    if (!ownerRole) throw createError('Default roles not seeded. Run: npm run db:seed', 500);

    if (await RestaurantAccount.findOne({ where: { email: restaurantData.email } }))
      throw createError('A restaurant with this email already exists', 409);
    if (await User.findOne({ where: { email: ownerData.email } }))
      throw createError('A user with this email already exists', 409);

    const slug = (restaurantData.slug || restaurantData.name)
      .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const restaurant = await RestaurantAccount.create({ ...restaurantData, slug, trialEndsAt });
    const owner = await User.scope('withPassword').create({
      ...ownerData,
      restaurantId: restaurant.id,
      roleId: ownerRole.id,
      passwordHash: ownerData.password,
    });

    logger.info('[AuthService] Restaurant registered', { restaurantId: restaurant.id });
    return { restaurant, owner: owner.toSafeObject() };
  }

  static async login({ email, password }) {
    const user = await User.scope('withPassword').findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }, { model: RestaurantAccount, as: 'restaurant' }],
    });

    if (!user) throw createError('Invalid email or password', 401);
    if (!user.isActive) throw createError('Account is disabled', 403);

    const match = await user.comparePassword(password);
    if (!match) throw createError('Invalid email or password', 401);

    const payload = { userId: user.id, email: user.email, role: user.role?.name, restaurantId: user.restaurantId };
    const { accessToken, refreshToken } = generateTokens(payload);

    await user.update({
      refreshTokenHash: await bcrypt.hash(refreshToken, 10),
      lastLoginAt: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role?.name, restaurantId: user.restaurantId, restaurant: user.restaurant },
    };
  }

  static async refreshToken(incomingToken) {
    let decoded;
    try { decoded = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET); }
    catch { throw createError('Invalid or expired refresh token', 401); }

    const user = await User.scope('withPassword').findByPk(decoded.userId, { include: [{ model: Role, as: 'role' }] });
    if (!user?.isActive) throw createError('User not found or disabled', 401);
    if (!user.refreshTokenHash) throw createError('Session expired. Please log in again.', 401);

    const match = await bcrypt.compare(incomingToken, user.refreshTokenHash);
    if (!match) throw createError('Token mismatch. Please log in again.', 401);

    const payload = { userId: user.id, email: user.email, role: user.role?.name, restaurantId: user.restaurantId };
    const { accessToken, refreshToken } = generateTokens(payload);
    await user.update({ refreshTokenHash: await bcrypt.hash(refreshToken, 10) });
    return { accessToken, refreshToken };
  }

  static async logout(userId) {
    await User.update({ refreshTokenHash: null }, { where: { id: userId } });
  }

  static async createStaff({ restaurantId, roleId, staffData }) {
    const role = await Role.findByPk(roleId);
    if (!role) throw createError('Role not found', 404);
    if (role.name === 'super_admin') throw createError('Cannot assign super_admin role to staff', 403);

    if (await User.findOne({ where: { email: staffData.email } }))
      throw createError('Email already in use', 409);

    const user = await User.scope('withPassword').create({
      ...staffData, restaurantId, roleId, passwordHash: staffData.password,
    });
    return user.toSafeObject();
  }

  static async listRoles() {
    return Role.findAll({ order: [['name', 'ASC']] });
  }
}
