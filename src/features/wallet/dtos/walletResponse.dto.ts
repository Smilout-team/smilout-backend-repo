export interface WalletBalanceResponse {
  walletId: string;
  balance: number;
  currency: string;
  monthlyDeposit: number;
  monthlySpent: number;
}

export interface CreateTopUpCheckoutResponse {
  topUpRequestId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'PENDING';
  checkoutUrl: string;
  checkoutFields: Record<string, string | number>;
  expiresInMinutes: number;
  createdAt: Date;
}

export interface TopUpStatusResponse {
  topUpRequestId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  transactionId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionHistoryItem {
  id: string;
  transactionType: string;
  amount: number;
  referenceId: string;
  createdAt: Date;
}

export interface TransactionHistoryResponse {
  transactions: TransactionHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
