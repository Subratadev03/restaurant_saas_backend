import { OrderController } from '@/modules/order/order.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';

export async function PATCH(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return OrderController.updateStatus(req, ctx, user);
}
