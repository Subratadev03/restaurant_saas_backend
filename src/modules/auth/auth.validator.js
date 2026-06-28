import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
});

export const registerRestaurantSchema = z.object({
  restaurant: z.object({
    name:    z.string().min(2),
    email:   z.string().email(),
    phone:   z.string().optional(),
    address: z.string().optional(),
    city:    z.string().optional(),
    slug:    z.string().regex(/^[a-z0-9-]+$/).optional(),
  }),
  owner: z.object({
    firstName: z.string().min(1),
    lastName:  z.string().optional(),
    email:     z.string().email(),
    password:  z.string().min(8),
    phone:     z.string().optional(),
  }),
});

export const refreshTokenSchema  = z.object({ refreshToken: z.string().min(1) });

export const createStaffSchema   = z.object({
  roleId:    z.string().uuid(),
  firstName: z.string().min(1),
  lastName:  z.string().optional(),
  email:     z.string().email(),
  password:  z.string().min(8),
  phone:     z.string().optional(),
});
