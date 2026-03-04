export interface CreateOrderParams {
  consumerId: string;
  storeId: string;
  orderType: 'INSTORE' | 'DELIVERY';
  status: 'PENDING' | 'PAID' | 'PREPARING';
  totalAmount: number;
}
