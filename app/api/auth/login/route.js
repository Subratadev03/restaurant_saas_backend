import { AuthController } from '@/modules/auth/auth.controller.js';

export const POST = (req) => AuthController.login(req);
