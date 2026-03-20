import { z } from 'zod';

export const googleAuthSchema = z.object({
  body: z.object({
    authCode: z.string().min(1, 'Mã xác thực Google không được để trống'),
  }),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
