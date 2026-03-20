export interface CreateTopUpCheckoutRequestDto {
  amount: number;
  paymentMethod?: 'BANK_TRANSFER' | 'NAPAS_BANK_TRANSFER';
  description?: string;
}

export interface GetTransactionHistoryQueryDto {
  page?: number;
  limit?: number;
  transactionType?: 'DEPOSIT' | 'PURCHASE' | 'REFUND' | 'SUBSCRIPTION_PAYMENT';
}
