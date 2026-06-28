import { RestaurantController } from '@/modules/restaurant/restaurant.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';

export async function PUT(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return RestaurantController.updateSettings(req, ctx, user);
}
