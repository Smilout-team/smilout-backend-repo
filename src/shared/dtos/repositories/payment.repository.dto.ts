export interface PaymentItemDto {
  productId: string;
  quantity: number;
}

export interface CreatePaymentDto {
  storeId: string;
  items: PaymentItemDto[];
}
