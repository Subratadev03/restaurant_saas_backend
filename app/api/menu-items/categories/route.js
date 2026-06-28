import { MenuController } from '@/modules/menu/menu.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';

export async function GET(req) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return MenuController.getCategories(req, user);
}
