import { SePayPgClient } from 'sepay-pg-node';
import { config } from '@/config/index.js';
import { type CreateCheckoutFieldsInput } from '@/infrastructure/interfaces/createCheckoutFieldsInput.js';

const getSePayClient = (): SePayPgClient => {
  if (!config.sepay.merchantId || !config.sepay.secretKey) {
    throw new Error('SePay config is missing merchantId or secretKey');
  }

  return new SePayPgClient({
    env: config.sepay.env || 'sandbox',
    merchant_id: config.sepay.merchantId,
    secret_key: config.sepay.secretKey,
  });
};

const buildCheckoutUrl = (): string => {
  return config.sepay.env === 'production'
    ? 'https://pay.sepay.vn/v1/checkout/init'
    : 'https://pay-sandbox.sepay.vn/v1/checkout/init';
};

const createCheckoutFields = (
  input: CreateCheckoutFieldsInput
): Record<string, string | number> => {
  const client = getSePayClient();

  const sdkFields = client.checkout.initOneTimePaymentFields({
    operation: 'PURCHASE',
    payment_method: input.paymentMethod,
    order_invoice_number: input.invoiceNumber,
    order_amount: input.amount,
    currency: input.currency,
    order_description: input.orderDescription,
    customer_id: input.customerId,
    success_url: input.successUrl,
    error_url: input.errorUrl,
    cancel_url: input.cancelUrl,
    custom_data: input.customData,
  } as any);

  const fieldsWithNotification = {
    ...sdkFields,
    notification_url: input.notificationUrl,
  };

  return Object.entries(fieldsWithNotification).reduce<Record<string, string | number>>(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    },
    {}
  );
};

const validateSePaySecretKey = (
  providedKey: string | undefined
): boolean => {
  return providedKey === config.sepay.secretKey;
};

const sepayService = {
  buildCheckoutUrl,
  createCheckoutFields,
  validateSePaySecretKey,
};

export default sepayService;
