import { z } from 'zod';

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z
      .string()
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email không hợp lệ')
      .max(100, 'Email tối đa 100 ký tự'),

    otp: z
      .string()
      .length(6, 'OTP phải gồm 6 chữ số')
      .regex(/^\d+$/, 'OTP chỉ được chứa số'),
  }),
});
