import { z } from 'zod';

export const scanProductSchema = z.object({
  body: z.object({
    barcode: z.string().trim().min(1, 'Barcode is required'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
