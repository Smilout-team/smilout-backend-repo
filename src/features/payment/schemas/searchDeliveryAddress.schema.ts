import { z } from 'zod';

export const searchDeliveryAddressSchema = z.object({
  query: z.object({
    keyword: z.string().trim().min(2).max(100),
    userLatitude: z.coerce.number().min(-90).max(90),
    userLongitude: z.coerce.number().min(-180).max(180),
  }),
});
