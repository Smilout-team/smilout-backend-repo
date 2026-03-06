import { z } from 'zod';

export const processPaymentSchema = z.object({
  body: z.object({
    orderId: z.uuid('Mã phiên mua hàng không hợp lệ'),
  }),
});
