import { z } from 'zod';

export const resetPasswordSchema = z.object({
  body: z
    .object({
      email: z
        .string()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email không hợp lệ')
        .max(100, 'Email tối đa 100 ký tự'),

      otp: z
        .string()
        .length(6, 'OTP phải gồm 6 chữ số')
        .regex(/^\d+$/, 'OTP chỉ được chứa số'),

      newPassword: z
        .string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .max(100, 'Mật khẩu tối đa 100 ký tự'),

      confirmPassword: z
        .string()
        .min(8, 'Xác nhận mật khẩu phải có ít nhất 8 ký tự')
        .max(100, 'Xác nhận mật khẩu tối đa 100 ký tự'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Xác nhận mật khẩu không khớp',
      path: ['confirmPassword'],
    }),
});
