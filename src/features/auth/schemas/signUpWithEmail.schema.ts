import { z } from 'zod';

export const signUpWithEmailSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Họ tên không được để trống'),
      email: z.email('Email sai định dạng'),
      phoneNumber: z
        .string()
        .min(1, 'Số điện thoại không được để trống')
        .max(15, 'Số điện thoại không hợp lệ'),
      password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: 'Passwords do not match',
      path: ['passwordConfirmation'],
    }),
});
