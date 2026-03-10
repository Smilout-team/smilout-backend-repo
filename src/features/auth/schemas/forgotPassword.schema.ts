import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email không hợp lệ')
      .max(100, 'Email tối đa 100 ký tự'),
  }),
});
