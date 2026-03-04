import { z } from 'zod';

export const storeDetailSchema = z.object({
  params: z.object({
    storeId: z.uuid('Store ID không hợp lệ'),
  }),
});
