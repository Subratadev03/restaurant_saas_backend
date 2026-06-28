import { MenuItem, Recipe, Ingredient, Stock } from '../../models/index.js';
import { getSequelize } from '../../config/sequelize.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { errorHandler, createError } from '../../middleware/error.middleware.js';
import { z } from 'zod';

const createSchema = z.object({
  name:            z.string().min(1).max(200),
  description:     z.string().optional(),
  category:        z.string().min(1).max(100),
  price:           z.number().min(0),
  imageUrl:        z.string().url().optional().or(z.literal('')),
  isAvailable:     z.boolean().default(true),
  isVeg:           z.boolean().default(false),
  preparationTime: z.number().int().min(1).optional(),
  calories:        z.number().int().min(0).optional(),
  tags:            z.array(z.string()).optional(),
  sortOrder:       z.number().int().default(0),
});

const recipeSchema = z.object({
  ingredients: z.array(z.object({
    ingredientId:     z.string().uuid(),
    quantityRequired: z.number().min(0.001),
  })).min(1),
});

export class MenuController {
  static list(req, user) {
    return errorHandler(req, async () => {
      const url = new URL(req.url);
      const category    = url.searchParams.get('category');
      const available   = url.searchParams.get('available');
      const search      = url.searchParams.get('search');

      const where = { restaurantId: user.restaurantId };
      if (category)             where.category    = category;
      if (available === 'true') where.isAvailable = true;
      if (available === 'false') where.isAvailable = false;

      if (search) {
        const { Op } = await import('sequelize');
        where[Op.or] = [
          { name:     { [Op.iLike]: `%${search}%` } },
          { category: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const items = await MenuItem.findAll({
        where,
        order: [['sortOrder', 'ASC'], ['category', 'ASC'], ['name', 'ASC']],
      });

      // Group by category for convenience
      const grouped = items.reduce((acc, item) => {
        const cat = item.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      }, {});

      return sendSuccess({ items, grouped, categories: Object.keys(grouped) });
    });
  }

  static getById(req, { params }, user) {
    return errorHandler(req, async () => {
      const item = await MenuItem.findOne({ where: { id: params.id, restaurantId: user.restaurantId } });
      if (!item) return sendError('Menu item not found', 404);
      return sendSuccess(item);
    });
  }

  static create(req, user) {
    return errorHandler(req, async () => {
      const parsed = createSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);

      const item = await MenuItem.create({ ...parsed.data, restaurantId: user.restaurantId });
      return sendSuccess(item, 'Menu item created', 201);
    });
  }

  static update(req, { params }, user) {
    return errorHandler(req, async () => {
      const parsed = createSchema.partial().safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);

      const item = await MenuItem.findOne({ where: { id: params.id, restaurantId: user.restaurantId } });
      if (!item) return sendError('Menu item not found', 404);

      await item.update(parsed.data);
      return sendSuccess(item, 'Menu item updated');
    });
  }

  static delete(req, { params }, user) {
    return errorHandler(req, async () => {
      const item = await MenuItem.findOne({ where: { id: params.id, restaurantId: user.restaurantId } });
      if (!item) return sendError('Menu item not found', 404);
      await item.destroy();
      return sendSuccess(null, 'Menu item deleted');
    });
  }

  static toggleAvailability(req, { params }, user) {
    return errorHandler(req, async () => {
      const item = await MenuItem.findOne({ where: { id: params.id, restaurantId: user.restaurantId } });
      if (!item) return sendError('Menu item not found', 404);
      await item.update({ isAvailable: !item.isAvailable });
      return sendSuccess(item, `Item marked ${item.isAvailable ? 'available' : 'unavailable'}`);
    });
  }

  // ── Recipe endpoints ────────────────────────────────────────────────────────

  static getRecipe(req, { params }, user) {
    return errorHandler(req, async () => {
      const item = await MenuItem.findOne({ where: { id: params.id, restaurantId: user.restaurantId } });
      if (!item) return sendError('Menu item not found', 404);

      const recipe = await Recipe.findAll({
        where: { menuItemId: params.id, restaurantId: user.restaurantId, isActive: true },
        include: [{
          model: Ingredient,
          as: 'ingredient',
          include: [{ model: Stock, as: 'stock' }],
        }],
      });

      return sendSuccess({ menuItem: item, recipe });
    });
  }

  static setRecipe(req, { params }, user) {
    return errorHandler(req, async () => {
      const item = await MenuItem.findOne({ where: { id: params.id, restaurantId: user.restaurantId } });
      if (!item) return sendError('Menu item not found', 404);

      const parsed = recipeSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);

      const sequelize = getSequelize();
      await sequelize.transaction(async (t) => {
        // Deactivate old recipe entries
        await Recipe.update(
          { isActive: false },
          { where: { menuItemId: params.id, restaurantId: user.restaurantId }, transaction: t }
        );

        // Create new recipe entries
        await Recipe.bulkCreate(
          parsed.data.ingredients.map((ing) => ({
            restaurantId:     user.restaurantId,
            menuItemId:       params.id,
            menuItemName:     item.name,
            ingredientId:     ing.ingredientId,
            quantityRequired: ing.quantityRequired,
            isActive:         true,
          })),
          { transaction: t }
        );
      });

      const updated = await Recipe.findAll({
        where: { menuItemId: params.id, restaurantId: user.restaurantId, isActive: true },
        include: [{ model: Ingredient, as: 'ingredient', include: [{ model: Stock, as: 'stock' }] }],
      });

      return sendSuccess({ menuItem: item, recipe: updated }, 'Recipe saved');
    });
  }

  static deleteRecipe(req, { params }, user) {
    return errorHandler(req, async () => {
      await Recipe.update(
        { isActive: false },
        { where: { menuItemId: params.id, restaurantId: user.restaurantId } }
      );
      return sendSuccess(null, 'Recipe removed');
    });
  }

  static getCategories(req, user) {
    return errorHandler(req, async () => {
      const { Op } = await import('sequelize');
      const sequelize = getSequelize();
      const [rows] = await sequelize.query(
        'SELECT DISTINCT category FROM menu_items WHERE restaurant_id = :rid AND is_available = true ORDER BY category',
        { replacements: { rid: user.restaurantId } }
      );
      return sendSuccess(rows.map((r) => r.category));
    });
  }
}
