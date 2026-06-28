import { CustomerController } from '@/modules/customer/customer.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';

export async function POST(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return CustomerController.redeemReward(req, ctx, user);
}
