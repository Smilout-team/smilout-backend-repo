import { z } from 'zod';

export const scanStoreSchema = z.object({
  body: z.object({
    storeId: z.string().uuid('Store ID không hợp lệ'),
  }),
});
