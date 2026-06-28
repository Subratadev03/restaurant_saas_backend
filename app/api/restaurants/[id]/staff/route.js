import { RestaurantController } from '@/modules/restaurant/restaurant.controller.js';
import { AuthController } from '@/modules/auth/auth.controller.js';
import { authenticate, authorize } from '@/middleware/auth.middleware.js';

export async function GET(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return RestaurantController.getStaff(req, ctx, user);
}

export async function POST(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  const denied = authorize(user, ['restaurant_owner', 'manager', 'super_admin']);
  if (denied) return denied;
  return AuthController.createStaff(req, user);
}
