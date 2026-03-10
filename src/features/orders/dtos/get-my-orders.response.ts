export interface OrderItemDto {
  productName: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface OrderHistoryItemDto {
  id: string;
  orderType: 'DELIVERY' | 'INSTORE';
  status: 'PENDING' | 'PAID' | 'PREPARING' | 'COMPLETED';
  deliveryAddress: string | null;
  deliveryOption: 'ASAP' | 'SCHEDULED' | null;
  scheduledDeliveryAt: Date | null;
  createdAt: Date;
  totalAmount: number;
  store: {
    id: string;
    storeName: string;
    address: string;
  };
  totalItems: number;
  items: OrderItemDto[];
}
