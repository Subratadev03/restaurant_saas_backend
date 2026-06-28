import { Customer, LoyaltyPoint, Reward, Order } from '../../models/index.js';
import { getSequelize } from '../../config/sequelize.js';
import { sendSuccess, sendError, sendPaginated } from '../../utils/response.js';
import { errorHandler } from '../../middleware/error.middleware.js';
import { getPagination } from '../../middleware/auth.middleware.js';
import { z } from 'zod';

const createSchema  = z.object({ firstName: z.string().min(1), lastName: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional(), dateOfBirth: z.string().optional(), gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(), tags: z.array(z.string()).optional() });
const pointsSchema  = z.object({ type: z.enum(['earned', 'redeemed', 'adjusted']), points: z.number().int().min(1), orderId: z.string().uuid().optional(), description: z.string().optional() });
const redeemSchema  = z.object({ rewardId: z.string().uuid(), orderId: z.string().uuid().optional() });
const rewardSchema  = z.object({ name: z.string().min(1), description: z.string().optional(), pointsCost: z.number().int().min(1), rewardType: z.enum(['discount_flat', 'discount_percentage', 'free_item', 'custom']), rewardValue: z.object({}).passthrough().optional(), stock: z.number().int().optional(), validUntil: z.string().datetime().optional() });

async function getCustomerBalance(customerId, restaurantId) {
  const sequelize = getSequelize();
  const [[{ balance }]] = await sequelize.query(
    `SELECT COALESCE(SUM(CASE WHEN type = 'earned' OR type = 'adjusted' THEN points WHEN type = 'redeemed' THEN -points ELSE 0 END), 0) AS balance FROM loyalty_points WHERE customer_id = :cid AND restaurant_id = :rid`,
    { replacements: { cid: customerId, rid: restaurantId } }
  );
  return parseInt(balance, 10);
}

export class CustomerController {
  static list(req, user) {
    return errorHandler(req, async () => {
      const url = new URL(req.url);
      const { page, limit, offset } = getPagination(url);
      const search = url.searchParams.get('search');
      const where  = { restaurantId: user.restaurantId, isActive: true };
      if (search) {
        const { Op } = await import('sequelize');
        where[Op.or] = [
          { firstName:  { [Op.iLike]: `%${search}%` } },
          { lastName:   { [Op.iLike]: `%${search}%` } },
          { email:      { [Op.iLike]: `%${search}%` } },
          { phone:      { [Op.iLike]: `%${search}%` } },
        ];
      }
      const { count, rows } = await Customer.findAndCountAll({ where, limit, offset, order: [['createdAt', 'DESC']] });
      return sendPaginated(rows, count, page, limit);
    });
  }

  static create(req, user) {
    return errorHandler(req, async () => {
      const parsed = createSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      if (parsed.data.email) {
        const dup = await Customer.findOne({ where: { restaurantId: user.restaurantId, email: parsed.data.email } });
        if (dup) return sendError('Customer with this email already exists', 409);
      }
      return sendSuccess(await Customer.create({ ...parsed.data, restaurantId: user.restaurantId }), 'Customer created', 201);
    });
  }

  static getById(req, { params }, user) {
    return errorHandler(req, async () => {
      const customer = await Customer.findOne({ where: { id: params.id, restaurantId: user.restaurantId } });
      if (!customer) return sendError('Customer not found', 404);
      const balance = await getCustomerBalance(params.id, user.restaurantId);
      return sendSuccess({ ...customer.toJSON(), loyaltyBalance: balance });
    });
  }

  static update(req, { params }, user) {
    return errorHandler(req, async () => {
      const parsed = createSchema.partial().safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      const customer = await Customer.findOne({ where: { id: params.id, restaurantId: user.restaurantId } });
      if (!customer) return sendError('Customer not found', 404);
      await customer.update(parsed.data);
      return sendSuccess(customer, 'Customer updated');
    });
  }

  static adjustPoints(req, { params }, user) {
    return errorHandler(req, async () => {
      const parsed = pointsSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      const customer = await Customer.findOne({ where: { id: params.id, restaurantId: user.restaurantId } });
      if (!customer) return sendError('Customer not found', 404);
      if (parsed.data.type === 'redeemed') {
        const balance = await getCustomerBalance(params.id, user.restaurantId);
        if (balance < parsed.data.points) return sendError(`Insufficient points. Balance: ${balance}`, 400);
      }
      const entry = await LoyaltyPoint.create({ customerId: params.id, restaurantId: user.restaurantId, ...parsed.data });
      return sendSuccess({ entry, balance: await getCustomerBalance(params.id, user.restaurantId) }, 'Points updated', 201);
    });
  }

  static redeemReward(req, { params }, user) {
    return errorHandler(req, async () => {
      const parsed = redeemSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      const [customer, reward] = await Promise.all([
        Customer.findOne({ where: { id: params.id, restaurantId: user.restaurantId } }),
        Reward.findOne({ where: { id: parsed.data.rewardId, restaurantId: user.restaurantId, isActive: true } }),
      ]);
      if (!customer) return sendError('Customer not found', 404);
      if (!reward) return sendError('Reward not found', 404);
      const balance = await getCustomerBalance(params.id, user.restaurantId);
      if (balance < reward.pointsCost) return sendError(`Insufficient points. Need ${reward.pointsCost}, have ${balance}`, 400);
      const entry = await LoyaltyPoint.create({ customerId: params.id, restaurantId: user.restaurantId, type: 'redeemed', points: reward.pointsCost, orderId: parsed.data.orderId, description: `Redeemed: ${reward.name}` });
      await reward.increment('redeemedCount');
      return sendSuccess({ entry, reward: { name: reward.name, value: reward.rewardValue }, newBalance: balance - reward.pointsCost });
    });
  }

  static listRewards(req, user) {
    return errorHandler(req, async () => sendSuccess(await Reward.findAll({ where: { restaurantId: user.restaurantId, isActive: true } })));
  }

  static createReward(req, user) {
    return errorHandler(req, async () => {
      const parsed = rewardSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      return sendSuccess(await Reward.create({ ...parsed.data, restaurantId: user.restaurantId }), 'Reward created', 201);
    });
  }
}
