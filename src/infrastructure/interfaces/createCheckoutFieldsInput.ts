type CheckoutPaymentMethod = 'BANK_TRANSFER' | 'NAPAS_BANK_TRANSFER';

export interface CreateCheckoutFieldsInput {
  paymentMethod: CheckoutPaymentMethod;
  invoiceNumber: string;
  amount: number;
  currency: string;
  orderDescription: string;
  customerId: string;
  successUrl: string;
  errorUrl: string;
  cancelUrl: string;
  notificationUrl: string;
  customData: string;
}