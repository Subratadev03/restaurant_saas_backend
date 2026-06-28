import { MenuController } from '@/modules/menu/menu.controller.js';
import { authenticate, authorize } from '@/middleware/auth.middleware.js';

export async function GET(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return MenuController.getRecipe(req, ctx, user);
}

export async function PUT(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  const denied = authorize(user, ['restaurant_owner', 'manager', 'super_admin']);
  if (denied) return denied;
  return MenuController.setRecipe(req, ctx, user);
}

export async function DELETE(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  const denied = authorize(user, ['restaurant_owner', 'manager', 'super_admin']);
  if (denied) return denied;
  return MenuController.deleteRecipe(req, ctx, user);
}
