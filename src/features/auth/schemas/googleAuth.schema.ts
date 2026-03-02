import { z } from 'zod';

export const googleAuthSchema = z.object({
  body: z.object({
    authCode: z.string().min(1, 'Authorization code is required'),
  }),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
