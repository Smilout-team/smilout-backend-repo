import { z } from 'zod';

export const processPaymentSchema = z.object({
  body: z
    .object({
      orderId: z.uuid('Mã phiên mua hàng không hợp lệ'),
      deliveryAddress: z
        .string()
        .trim()
        .min(5, 'Địa chỉ giao hàng không hợp lệ')
        .max(255, 'Địa chỉ giao hàng tối đa 255 ký tự')
        .optional(),
      deliveryOption: z.enum(['ASAP', 'SCHEDULED']).optional(),
      scheduledDeliveryAt: z
        .string()
        .datetime('Thời gian hẹn giao không hợp lệ')
        .optional(),
      userLatitude: z.number().min(-90).max(90).optional(),
      userLongitude: z.number().min(-180).max(180).optional(),
    })
    .superRefine((value, ctx) => {
      if (value.deliveryOption === 'SCHEDULED' && !value.scheduledDeliveryAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['scheduledDeliveryAt'],
          message: 'Vui lòng chọn thời gian hẹn giao',
        });
      }
    }),
});
