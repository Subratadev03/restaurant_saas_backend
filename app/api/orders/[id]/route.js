import { OrderController } from '@/modules/order/order.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';

export async function GET(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return OrderController.getById(req, ctx, user);
}
