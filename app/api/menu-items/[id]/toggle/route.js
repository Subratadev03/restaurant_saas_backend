import { MenuController } from '@/modules/menu/menu.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';

export async function PATCH(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return MenuController.toggleAvailability(req, ctx, user);
}
