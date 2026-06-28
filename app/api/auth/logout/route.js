import { AuthController } from '@/modules/auth/auth.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';

export async function POST(req) {
  const user = await authenticate(req);
  if (user instanceof Response) return user;
  return AuthController.logout(req, user);
}
