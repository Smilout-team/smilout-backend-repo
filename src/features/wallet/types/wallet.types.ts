export type TopUpCallbackStatus = 'success' | 'error' | 'cancel';

export interface SePayIpnPayload {
  notification_type?: 'ORDER_PAID' | 'TRANSACTION_VOID' | string;
  custom_data?: string | Record<string, unknown>;
  order?: {
    order_id?: string;
    order_amount?: string | number;
    order_invoice_number?: string;
    custom_data?: string | Record<string, unknown>;
  };
  transaction?: {
    transaction_id?: string;
    transaction_amount?: string | number;
  };
}
