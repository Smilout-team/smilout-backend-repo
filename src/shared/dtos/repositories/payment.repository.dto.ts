export interface CreatePaymentDto {
  orderId: string;
}

export interface ProcessPaymentResponseDto {
  orderId: string;
  storeId: string;
  status: 'PAID';
  totalAmount: number;
}
