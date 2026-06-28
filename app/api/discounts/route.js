import { POSController } from '@/modules/pos/pos.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';

export async function GET(req) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return POSController.listDiscounts(req, user);
}

export async function POST(req) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return POSController.createDiscount(req, user);
}
