import { AuthService } from './auth.service.js';
import { loginSchema, registerRestaurantSchema, refreshTokenSchema, createStaffSchema } from './auth.validator.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { errorHandler } from '../../middleware/error.middleware.js';

export class AuthController {
  static login(req) {
    return errorHandler(req, async () => {
      const parsed = loginSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      return sendSuccess(await AuthService.login(parsed.data), 'Login successful');
    });
  }

  static register(req) {
    return errorHandler(req, async () => {
      const parsed = registerRestaurantSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      return sendSuccess(
        await AuthService.registerRestaurant({ restaurantData: parsed.data.restaurant, ownerData: parsed.data.owner }),
        'Restaurant registered', 201
      );
    });
  }

  static refresh(req) {
    return errorHandler(req, async () => {
      const parsed = refreshTokenSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      return sendSuccess(await AuthService.refreshToken(parsed.data.refreshToken), 'Token refreshed');
    });
  }

  static logout(req, user) {
    return errorHandler(req, async () => {
      await AuthService.logout(user.userId);
      return sendSuccess(null, 'Logged out');
    });
  }

  static createStaff(req, user) {
    return errorHandler(req, async () => {
      const parsed = createStaffSchema.safeParse(await req.json());
      if (!parsed.success) return sendError('Validation failed', 422, parsed.error.flatten().fieldErrors);
      return sendSuccess(
        await AuthService.createStaff({ restaurantId: user.restaurantId, roleId: parsed.data.roleId, staffData: parsed.data }),
        'Staff member created', 201
      );
    });
  }

  static listRoles(req) {
    return errorHandler(req, async () => sendSuccess(await AuthService.listRoles()));
  }
}
