import { MenuController } from '@/modules/menu/menu.controller.js';
import { authenticate, authorize } from '@/middleware/auth.middleware.js';

export async function GET(req) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return MenuController.list(req, user);
}

export async function POST(req) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  const denied = authorize(user, ['restaurant_owner', 'manager', 'super_admin']);
  if (denied) return denied;
  return MenuController.create(req, user);
}
