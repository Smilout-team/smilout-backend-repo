import { z } from 'zod';

export const repurchaseOrderSchema = z.object({
  body: z.object({
    orderId: z.uuid('Order ID phải là UUID hợp lệ'),
    userLatitude: z.number().min(-90).max(90).optional(),
    userLongitude: z.number().min(-180).max(180).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
