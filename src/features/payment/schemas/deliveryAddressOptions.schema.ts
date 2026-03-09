import { z } from 'zod';

export const deliveryAddressOptionsSchema = z.object({
  query: z.object({
    userLatitude: z.coerce.number().min(-90).max(90),
    userLongitude: z.coerce.number().min(-180).max(180),
  }),
});
