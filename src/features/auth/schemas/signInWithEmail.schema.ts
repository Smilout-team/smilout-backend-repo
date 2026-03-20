import { z } from 'zod';

export const signInWithEmailSchema = z.object({
  body: z.object({
    email: z.email('Email sai định dạng'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  }),
});
