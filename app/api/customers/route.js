import { CustomerController } from '@/modules/customer/customer.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';

export async function GET(req) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return CustomerController.list(req, user);
}

export async function POST(req) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return CustomerController.create(req, user);
}
