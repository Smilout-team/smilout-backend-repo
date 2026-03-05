import { z } from 'zod';

export const scanProductSchema = z.object({
  body: z.object({
    barcode: z.string().trim().min(1, 'Barcode không được để trống'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
