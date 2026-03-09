import { z } from 'zod';

export const repurchaseToCartSchema = z.object({
  body: z.object({
    sourceOrderId: z.uuid('Order ID không hợp lệ'),
    targetStoreId: z.uuid('Store ID không hợp lệ'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
