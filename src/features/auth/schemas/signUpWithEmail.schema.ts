import { z } from 'zod';

export const signUpWithEmailSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Full name is required'),
      email: z
        .email('Invalid email format'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: 'Passwords do not match',
      path: ['passwordConfirmation'],
    }),
});
