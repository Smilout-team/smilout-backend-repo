import crypto from 'crypto';
import { config } from '@/config/index.js';

export const generateInvoiceNumber = (): string => {
  return `TOPUP-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

export const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const parseCustomData = (
  value: string | Record<string, unknown> | undefined
): Record<string, unknown> | undefined => {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
};

export const getBackendBaseUrl = (): string => {
  const useProdUrl =
    config.nodeEnv === 'production' &&
    typeof config.productionUrl === 'string' &&
    config.productionUrl.length > 0;

  const baseUrl = useProdUrl
    ? config.productionUrl!
    : `http://localhost:${config.port}`;

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

export const buildSuccessCallbackUrl = (invoiceNumber: string): string => {
  return `${getBackendBaseUrl()}/api/v1/wallet/top-up/callback/success?invoiceNumber=${invoiceNumber}`;
};

export const buildErrorCallbackUrl = (invoiceNumber: string): string => {
  return `${getBackendBaseUrl()}/api/v1/wallet/top-up/callback/error?invoiceNumber=${invoiceNumber}`;
};

export const buildCancelCallbackUrl = (invoiceNumber: string): string => {
  return `${getBackendBaseUrl()}/api/v1/wallet/top-up/callback/cancel?invoiceNumber=${invoiceNumber}`;
};

export const buildIpnUrl = (): string => {
  return (
    config.sepay.ipnUrl || `${getBackendBaseUrl()}/api/v1/wallet/sepay/ipn`
  );
};
