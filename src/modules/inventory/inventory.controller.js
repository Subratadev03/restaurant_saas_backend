import { Ingredient, Stock, Recipe } from '../../models/index.js';
import { getSequelize } from '../../config/sequelize.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { errorHandler } from '../../middleware/error.middleware.js';
import { z } from 'zod';

const createIngredientSchema = z.object({
  name:               z.string().min(1),
  unit:               z.enum(['kg', 'g', 'l', 'ml', 'pcs', 'dozen']).default('pcs'),
  category:           z.string().optional(),
  lowStockThreshold:  z.number().min(0).default(10),
  costPerUnit:        z.number().min(0).optional(),
  initialStock:       z.number().min(0).default(0),
});

const restockSchema = z.object({
  ingredientId: z.string().uuid(),
  quantity:     z.number().min(0.001),
});

const recipeSchema = z.object({
  menuItemName: z.string().min(1),
  ingredients:  z.array(z.object({ ingredientId: z.string().uuid(), quantityRequired: z.number().min(0.001) })).min(1),
});

export class InventoryController {
  static listIngredients(req, user) {
    return errorHandler(req, async () => {
      const items = await Ingredient.findAll({
        where: { restaurantId: user.restaurantId, isActive: true },
        include: [{ model: Stock, as: 'stock' }],
      });
      return sendSuccess(items);
    });
  }

  static createIngredient(req, user) {
    return errorHandler(req, async () => {
      const parsed = createIngredientSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      const { initialStock, ...data } = parsed.data;
      const ingredient = await Ingredient.create({ ...data, restaurantId: user.restaurantId });
      await Stock.create({ ingredientId: ingredient.id, restaurantId: user.restaurantId, quantity: initialStock });
      return sendSuccess(ingredient, 'Ingredient created', 201);
    });
  }

  static restock(req, user) {
    return errorHandler(req, async () => {
      const parsed = restockSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      const stock = await Stock.findOne({ where: { ingredientId: parsed.data.ingredientId, restaurantId: user.restaurantId } });
      if (!stock) return sendError('Stock record not found', 404);
      await stock.update({ quantity: parseFloat(stock.quantity) + parsed.data.quantity, lastRestockedAt: new Date() });
      return sendSuccess(stock, 'Stock updated');
    });
  }

  static async getLowStockAlerts(req, user) {
    return errorHandler(req, async () => {
      const sequelize = getSequelize();
      const [results] = await sequelize.query(
        `SELECT i.id, i.name, i.unit, i.low_stock_threshold, s.quantity
         FROM ingredients i JOIN stocks s ON s.ingredient_id = i.id
         WHERE i.restaurant_id = :rid AND s.quantity <= i.low_stock_threshold AND i.is_active = true`,
        { replacements: { rid: user.restaurantId } }
      );
      return sendSuccess(results);
    });
  }

  static getRecipe(req, { params }, user) {
    return errorHandler(req, async () => {
      const items = await Recipe.findAll({
        where: { restaurantId: user.restaurantId, menuItemId: params.menuItemId, isActive: true },
        include: [{ model: Ingredient, as: 'ingredient', include: [{ model: Stock, as: 'stock' }] }],
      });
      return sendSuccess(items);
    });
  }

  static setRecipe(req, { params }, user) {
    return errorHandler(req, async () => {
      const parsed = recipeSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      const sequelize = getSequelize();
      await sequelize.transaction(async (t) => {
        await Recipe.update({ isActive: false }, { where: { restaurantId: user.restaurantId, menuItemId: params.menuItemId }, transaction: t });
        await Recipe.bulkCreate(
          parsed.data.ingredients.map((ing) => ({ restaurantId: user.restaurantId, menuItemId: params.menuItemId, menuItemName: parsed.data.menuItemName, ingredientId: ing.ingredientId, quantityRequired: ing.quantityRequired, isActive: true })),
          { transaction: t }
        );
      });
      return sendSuccess(null, 'Recipe saved');
    });
  }
}
