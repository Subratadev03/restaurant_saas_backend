import { Invoice, Tax, Discount, Order } from '../../models/index.js';
import { getSequelize } from '../../config/sequelize.js';
import { sendSuccess, sendError, sendPaginated } from '../../utils/response.js';
import { errorHandler } from '../../middleware/error.middleware.js';
import { getPagination } from '../../middleware/auth.middleware.js';
import { z } from 'zod';

const invoiceSchema  = z.object({ orderId: z.string().uuid(), customerId: z.string().uuid().optional(), subtotal: z.number().min(0), discountCode: z.string().optional(), paymentMethod: z.enum(['cash', 'card', 'upi', 'wallet', 'online', 'split']), notes: z.string().optional() });
const taxSchema      = z.object({ name: z.string().min(1), rate: z.number().min(0).max(100), isInclusive: z.boolean().default(false) });
const discountSchema = z.object({ name: z.string().min(1), code: z.string().optional(), type: z.enum(['percentage', 'flat']), value: z.number().min(0), minOrderAmount: z.number().min(0).default(0), maxDiscountAmount: z.number().optional(), usageLimit: z.number().int().optional(), validFrom: z.string().datetime().optional(), validUntil: z.string().datetime().optional() });

async function getInvoiceNumber(restaurantId) {
  const sequelize = getSequelize();
  const [[{ count }]] = await sequelize.query('SELECT COUNT(*) AS count FROM invoices WHERE restaurant_id = :rid', { replacements: { rid: restaurantId } });
  return `INV-${new Date().getFullYear()}-${String(parseInt(count, 10) + 1).padStart(5, '0')}`;
}

export class POSController {
  static generateInvoice(req, user) {
    return errorHandler(req, async () => {
      const parsed = invoiceSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      const { orderId, customerId, subtotal, discountCode, paymentMethod, notes } = parsed.data;

      const taxes = await Tax.findAll({ where: { restaurantId: user.restaurantId, isActive: true } });

      let discountAmount = 0, appliedCode = null;
      if (discountCode) {
        const disc = await Discount.findOne({ where: { restaurantId: user.restaurantId, code: discountCode, isActive: true } });
        if (disc && !(disc.usageLimit && disc.usedCount >= disc.usageLimit) && subtotal >= disc.minOrderAmount) {
          discountAmount = disc.type === 'percentage' ? Math.min((subtotal * disc.value) / 100, disc.maxDiscountAmount || Infinity) : disc.value;
          discountAmount = parseFloat(discountAmount.toFixed(2));
          appliedCode = disc.code;
          await disc.increment('usedCount');
        }
      }

      const discountedSubtotal = subtotal - discountAmount;
      const taxBreakdown = taxes.map((t) => ({ name: t.name, rate: t.rate, amount: parseFloat(((discountedSubtotal * t.rate) / 100).toFixed(2)) }));
      const taxTotal = parseFloat(taxBreakdown.reduce((s, t) => s + t.amount, 0).toFixed(2));
      const grandTotal = parseFloat((discountedSubtotal + taxTotal).toFixed(2));

      const invoice = await Invoice.create({ restaurantId: user.restaurantId, orderId, customerId, invoiceNumber: await getInvoiceNumber(user.restaurantId), subtotal, taxBreakdown, taxTotal, discountCode: appliedCode, discountAmount, grandTotal, paymentMethod, status: 'issued', issuedAt: new Date(), notes });
      return sendSuccess(invoice, 'Invoice generated', 201);
    });
  }

  static listInvoices(req, user) {
    return errorHandler(req, async () => {
      const url = new URL(req.url);
      const { page, limit, offset } = getPagination(url);
      const where = { restaurantId: user.restaurantId };
      const s = url.searchParams.get('status'); if (s) where.status = s;
      const { count, rows } = await Invoice.findAndCountAll({ where, limit, offset, order: [['createdAt', 'DESC']] });
      return sendPaginated(rows, count, page, limit);
    });
  }

  static getInvoice(req, { params }, user) {
    return errorHandler(req, async () => {
      const invoice = await Invoice.findOne({ where: { id: params.id, restaurantId: user.restaurantId } });
      if (!invoice) return sendError('Invoice not found', 404);
      return sendSuccess(invoice);
    });
  }

  static listTaxes(req, user) {
    return errorHandler(req, async () => sendSuccess(await Tax.findAll({ where: { restaurantId: user.restaurantId, isActive: true } })));
  }

  static createTax(req, user) {
    return errorHandler(req, async () => {
      const parsed = taxSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      return sendSuccess(await Tax.create({ ...parsed.data, restaurantId: user.restaurantId }), 'Tax created', 201);
    });
  }

  static listDiscounts(req, user) {
    return errorHandler(req, async () => sendSuccess(await Discount.findAll({ where: { restaurantId: user.restaurantId, isActive: true } })));
  }

  static createDiscount(req, user) {
    return errorHandler(req, async () => {
      const parsed = discountSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      return sendSuccess(await Discount.create({ ...parsed.data, restaurantId: user.restaurantId }), 'Discount created', 201);
    });
  }
}
