import { z } from 'zod';

export const getOrderItemsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    orderId: z.string().trim().min(1, 'Order ID không hợp lệ'),
  }),
});
