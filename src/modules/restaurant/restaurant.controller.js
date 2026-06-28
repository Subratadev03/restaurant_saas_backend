import { RestaurantAccount, User, Role } from '../../models/index.js';
import { createError } from '../../middleware/error.middleware.js';
import { z } from 'zod';
import { sendSuccess, sendError, sendPaginated } from '../../utils/response.js';
import { errorHandler } from '../../middleware/error.middleware.js';
import { getPagination } from '../../middleware/auth.middleware.js';

const updateProfileSchema = z.object({
  name:     z.string().min(2).optional(),
  phone:    z.string().optional(),
  address:  z.string().optional(),
  city:     z.string().optional(),
  logo:     z.string().url().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
});

const updateSettingsSchema = z.object({
  posEnabled:              z.boolean().optional(),
  onlineOrderingEnabled:   z.boolean().optional(),
  loyaltyEnabled:          z.boolean().optional(),
  taxRate:                 z.number().min(0).max(100).optional(),
  serviceCharge:           z.number().min(0).max(100).optional(),
});

export class RestaurantController {
  static list(req, user) {
    return errorHandler(req, async () => {
      if (user.role !== 'super_admin') return sendError('Forbidden', 403);
      const url = new URL(req.url);
      const { page, limit, offset } = getPagination(url);
      const status = url.searchParams.get('status');
      const where = status ? { status } : {};
      const { count, rows } = await RestaurantAccount.findAndCountAll({ where, limit, offset, order: [['createdAt', 'DESC']] });
      return sendPaginated(rows, count, page, limit);
    });
  }

  static getById(req, { params }, user) {
    return errorHandler(req, async () => {
      const id = params.id;
      if (user.role !== 'super_admin' && user.restaurantId !== id)
        return sendError('Forbidden', 403);
      const restaurant = await RestaurantAccount.findByPk(id, {
        include: [{ model: User, as: 'staff', include: [{ model: Role, as: 'role' }] }],
      });
      if (!restaurant) return sendError('Restaurant not found', 404);
      return sendSuccess(restaurant);
    });
  }

  static update(req, { params }, user) {
    return errorHandler(req, async () => {
      if (user.role !== 'super_admin' && user.restaurantId !== params.id)
        return sendError('Forbidden', 403);
      const parsed = updateProfileSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      const restaurant = await RestaurantAccount.findByPk(params.id);
      if (!restaurant) return sendError('Restaurant not found', 404);
      await restaurant.update(parsed.data);
      return sendSuccess(restaurant, 'Restaurant updated');
    });
  }

  static updateSettings(req, { params }, user) {
    return errorHandler(req, async () => {
      if (user.restaurantId !== params.id && user.role !== 'super_admin')
        return sendError('Forbidden', 403);
      const parsed = updateSettingsSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      const restaurant = await RestaurantAccount.findByPk(params.id);
      if (!restaurant) return sendError('Restaurant not found', 404);
      await restaurant.update({ settings: { ...restaurant.settings, ...parsed.data } });
      return sendSuccess(restaurant, 'Settings updated');
    });
  }

  static getStaff(req, { params }, user) {
    return errorHandler(req, async () => {
      if (user.restaurantId !== params.id && user.role !== 'super_admin')
        return sendError('Forbidden', 403);
      const staff = await User.findAll({
        where: { restaurantId: params.id },
        include: [{ model: Role, as: 'role' }],
        order: [['createdAt', 'DESC']],
      });
      return sendSuccess(staff);
    });
  }
}
