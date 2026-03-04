import { z } from 'zod';

export const scanStoreSchema = z.object({
  body: z.object({
    storeId: z.uuid('Không nhận diện được cửa hàng'),
  }),
});
