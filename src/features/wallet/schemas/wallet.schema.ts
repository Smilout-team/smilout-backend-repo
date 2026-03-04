import { z } from 'zod';

export const createTopUpCheckoutSchema = z.object({
  body: z.object({
    amount: z
      .number()
      .min(10000, 'Số tiền phải lớn hơn 10,000 VND')
      .max(5000000, 'Số tiền không được vượt quá 5,000,000 VND'),
    paymentMethod: z.enum(['BANK_TRANSFER', 'NAPAS_BANK_TRANSFER']).optional(),
    description: z
      .string()
      .max(255, 'Mô tả không được vượt quá 255 ký tự')
      .optional(),
  }),
});

export const getTopUpStatusSchema = z.object({
  params: z.object({
    invoiceNumber: z.string().min(1, 'Invoice number là bắt buộc'),
  }),
});

export const getTransactionHistorySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, 'Trang phải lớn hơn 0'),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => val > 0 && val <= 100, 'Giới hạn phải từ 1 đến 100'),
    transactionType: z
      .enum(['DEPOSIT', 'PURCHASE', 'REFUND', 'SUBSCRIPTION_PAYMENT'])
      .optional(),
  }),
});

export const getTransactionByIdSchema = z.object({
  params: z.object({
    transactionId: z.uuid('Transaction ID không hợp lệ'),
  }),
});
