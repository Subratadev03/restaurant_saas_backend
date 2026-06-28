import { CustomerController } from '@/modules/customer/customer.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';

export async function GET(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return CustomerController.getById(req, ctx, user);
}

export async function PUT(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return CustomerController.update(req, ctx, user);
}
