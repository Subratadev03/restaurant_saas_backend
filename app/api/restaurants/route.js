import { RestaurantController } from '@/modules/restaurant/restaurant.controller.js';
import { authenticate, authorize } from '@/middleware/auth.middleware.js';

export async function GET(req) {
  const user = await authenticate(req);
  if (user instanceof Response) return user;
  const denied = authorize(user, ['super_admin']);
  if (denied) return denied;
  return RestaurantController.list(req, user);
}
