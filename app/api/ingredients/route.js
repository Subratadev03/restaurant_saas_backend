import { InventoryController } from '@/modules/inventory/inventory.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';

export async function GET(req) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return InventoryController.listIngredients(req, user);
}

export async function POST(req) {
  const user = await authenticate(req); if (user instanceof Response) return user;
  return InventoryController.createIngredient(req, user);
}
