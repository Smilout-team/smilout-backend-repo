import type { OrderItem } from 'generated/prisma/index.js';

export interface CreateOrderParams {
  consumerId: string;
  storeId: string;
  orderType: 'INSTORE' | 'DELIVERY';
  status: 'PENDING' | 'PAID' | 'PREPARING';
  totalAmount: number;
}

export interface CompletePaymentTransactionParams {
  consumerId: string;
  orderId: string;
  totalAmount: number;
  deliveryAddress?: string;
  deliveryPhoneNumber?: string;
  deliveryOption?: 'ASAP' | 'SCHEDULED';
  scheduledDeliveryAt?: Date | null;
  insufficientBalanceMessage: string;
  invalidOrderMessage: string;
}

export type OrderItemWithProduct = OrderItem & {
  product?: {
    name: string;
    imageUrls: string[];
    description: string;
    stockQuantity: number;
    expiryDate: Date | null;
    category: { name: string | null } | null;
  } | null;
};
