import { z } from 'zod';

export const nearbyStoresSchema = z.object({
  query: z.object({
    latitude: z.coerce
      .number({ message: 'Latitude không hợp lệ' })
      .min(-90, 'Latitude không hợp lệ')
      .max(90, 'Latitude không hợp lệ'),
    longitude: z.coerce
      .number({ message: 'Longitude không hợp lệ' })
      .min(-180, 'Longitude không hợp lệ')
      .max(180, 'Longitude không hợp lệ'),
    limit: z.coerce.number().int().min(1).max(20).optional().default(4),
  }),
});
