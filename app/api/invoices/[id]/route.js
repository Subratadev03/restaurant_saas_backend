import { POSController } from '@/modules/pos/pos.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';

export async function GET(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return POSController.getInvoice(req, ctx, user);
}
