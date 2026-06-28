import { MenuController } from '@/modules/menu/menu.controller.js';
import { authenticate, authorize } from '@/middleware/auth.middleware.js';

export async function GET(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return MenuController.getById(req, ctx, user);
}

export async function PUT(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  const denied = authorize(user, ['restaurant_owner', 'manager', 'super_admin']);
  if (denied) return denied;
  return MenuController.update(req, ctx, user);
}

export async function DELETE(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  const denied = authorize(user, ['restaurant_owner', 'manager', 'super_admin']);
  if (denied) return denied;
  return MenuController.delete(req, ctx, user);
}
