import { InventoryController } from '@/modules/inventory/inventory.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';

export async function GET(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return InventoryController.getRecipe(req, ctx, user);
}

export async function PUT(req, ctx) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return InventoryController.setRecipe(req, ctx, user);
}
