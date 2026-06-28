import { Order, OrderItem, PaymentTransaction, Customer, RestaurantTable } from '../../models/index.js';
import { createError } from '../../middleware/error.middleware.js';
import { getSequelize } from '../../config/sequelize.js';
import { logger } from '../../utils/logger.js';
import { z } from 'zod';
import { sendSuccess, sendError, sendPaginated } from '../../utils/response.js';
import { errorHandler } from '../../middleware/error.middleware.js';
import { getPagination } from '../../middleware/auth.middleware.js';

const STATUS_TRANSITIONS = {
  received:  ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready:     ['delivered'],
  delivered: [],
  cancelled: [],
};

const itemSchema = z.object({
  menuItemId:   z.string().uuid(),
  menuItemName: z.string().min(1),
  quantity:     z.number().int().min(1),
  unitPrice:    z.number().min(0),
  modifiers:    z.array(z.object({ name: z.string(), price: z.number() })).optional(),
  notes:        z.string().optional(),
});

const createSchema = z.object({
  type:           z.enum(['dine_in', 'takeaway', 'delivery', 'online']).default('dine_in'),
  tableNumber:    z.string().optional(),
  tableId:        z.string().uuid().optional(),
  customerId:     z.string().uuid().optional(),
  items:          z.array(itemSchema).min(1),
  notes:          z.string().optional(),
  deliveryAddress:z.object({ street: z.string(), city: z.string(), pincode: z.string() }).optional(),
});

const statusSchema  = z.object({ status: z.enum(['received', 'preparing', 'ready', 'delivered', 'cancelled']), reason: z.string().optional() });
const paymentSchema = z.object({ method: z.enum(['cash', 'card', 'upi', 'wallet', 'online']), amount: z.number().min(0.01), transactionRef: z.string().optional() });

async function generateOrderNumber(restaurantId) {
  const sequelize = getSequelize();
  const [[{ count }]] = await sequelize.query('SELECT COUNT(*) AS count FROM orders WHERE restaurant_id = :restaurantId', { replacements: { restaurantId } });
  return `ORD-${String(parseInt(count, 10) + 1).padStart(4, '0')}`;
}

export class OrderController {
  static list(req, user) {
    return errorHandler(req, async () => {
      const url = new URL(req.url);
      const { page, limit, offset } = getPagination(url);
      const where = { restaurantId: user.restaurantId };
      const s = url.searchParams.get('status'); if (s) where.status = s;
      const t = url.searchParams.get('type');   if (t) where.type   = t;
      const { count, rows } = await Order.findAndCountAll({
        where,
        include: [
          { model: OrderItem, as: 'items' },
          { model: Customer, as: 'customer', attributes: ['id', 'firstName', 'lastName', 'phone'] },
          { model: RestaurantTable, as: 'table', attributes: ['id', 'tableNumber', 'tableName', 'tableType'] },
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
      return sendPaginated(rows, count, page, limit);
    });
  }

  static create(req, user) {
    return errorHandler(req, async () => {
      const parsed = createSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);

      const { items, type, tableNumber, tableId, customerId, notes, deliveryAddress } = parsed.data;
      const sequelize = getSequelize();

      const result = await sequelize.transaction(async (t) => {
        const orderNumber = await generateOrderNumber(user.restaurantId);
        const subtotal    = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
        const taxRate     = 5; // default; real app should fetch from restaurant settings
        const taxAmount   = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
        const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));

        const order = await Order.create({ restaurantId: user.restaurantId, customerId, orderNumber, type, tableNumber, tableId, notes, deliveryAddress, subtotal, taxAmount, totalAmount }, { transaction: t });
        const orderItems = await OrderItem.bulkCreate(
          items.map((i) => ({ orderId: order.id, menuItemId: i.menuItemId, menuItemName: i.menuItemName, quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: parseFloat((i.unitPrice * i.quantity).toFixed(2)), modifiers: i.modifiers || [], notes: i.notes })),
          { transaction: t }
        );
        return { ...order.toJSON(), items: orderItems };
      });

      return sendSuccess(result, 'Order created', 201);
    });
  }

  static getById(req, { params }, user) {
    return errorHandler(req, async () => {
      const order = await Order.findOne({
        where: { id: params.id, restaurantId: user.restaurantId },
        include: [
          { model: OrderItem, as: 'items' },
          { model: PaymentTransaction, as: 'payments' },
          { model: Customer, as: 'customer', attributes: ['id', 'firstName', 'lastName', 'phone', 'email'] },
          { model: RestaurantTable, as: 'table', attributes: ['id', 'tableNumber', 'tableName', 'tableType', 'floor'] },
        ],
      });
      if (!order) return sendError('Order not found', 404);
      return sendSuccess(order);
    });
  }

  static updateStatus(req, { params }, user) {
    return errorHandler(req, async () => {
      const parsed = statusSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);

      const order = await Order.findOne({ where: { id: params.id, restaurantId: user.restaurantId } });
      if (!order) return sendError('Order not found', 404);

      const { status, reason } = parsed.data;
      if (!STATUS_TRANSITIONS[order.status].includes(status))
        return sendError(`Cannot move from '${order.status}' to '${status}'. Allowed: ${STATUS_TRANSITIONS[order.status].join(', ')}`, 400);

      const updates = { status };
      if (status === 'delivered') updates.completedAt = new Date();
      if (status === 'cancelled' && reason) updates.cancelledReason = reason;
      await order.update(updates);
      return sendSuccess(order, 'Order status updated');
    });
  }

  static recordPayment(req, { params }, user) {
    return errorHandler(req, async () => {
      const parsed = paymentSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      const order = await Order.findOne({ where: { id: params.id, restaurantId: user.restaurantId } });
      if (!order) return sendError('Order not found', 404);
      const payment = await PaymentTransaction.create({ orderId: params.id, restaurantId: user.restaurantId, status: 'completed', paidAt: new Date(), ...parsed.data });
      return sendSuccess(payment, 'Payment recorded', 201);
    });
  }
}
