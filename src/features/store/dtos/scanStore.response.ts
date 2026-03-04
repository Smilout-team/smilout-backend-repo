export interface ScanStoreResponse {
  orderId: string;
  storeId: string;
  orderType: 'INSTORE';
  status: 'PENDING';
  totalAmount: number;
}
