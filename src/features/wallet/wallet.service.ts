import walletRepository from '@/shared/repositories/wallet.repository.js';
import walletTransactionRepository from '@/shared/repositories/walletTransaction.repository.js';
import walletTopUpRequestRepository from '@/shared/repositories/walletTopUpRequest.repository.js';
import walletTransactionService from './services/walletTransaction.service.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '@/core/apiError.js';
import { WALLET_MESSAGES } from './wallet.messages.js';
import type {
  CreateTopUpCheckoutRequestDto,
  GetTransactionHistoryQueryDto,
} from './dtos/walletRequest.dto.js';
import type {
  WalletBalanceResponse,
  CreateTopUpCheckoutResponse,
  TopUpStatusResponse,
  TransactionHistoryResponse,
} from './dtos/walletResponse.dto.js';
import { config } from '@/config/index.js';
import type {
  SePayIpnPayload,
  TopUpCallbackStatus,
} from './types/wallet.types.js';
import { TOP_UP_EXPIRES_IN_MINUTES } from './constants/wallet.constants.js';
import {
  generateInvoiceNumber,
  toNumber,
  parseCustomData,
  buildSuccessCallbackUrl,
  buildErrorCallbackUrl,
  buildCancelCallbackUrl,
  buildIpnUrl,
} from './utils/wallet.utils.js';
import sepayService from '@/infrastructure/services/sepay.service.js';

const walletService = {
  getWalletBalance: async (userId: string): Promise<WalletBalanceResponse> => {
    const wallet = await walletRepository.getOrCreate(userId);

    const { monthlyDeposit, monthlySpent } =
      await walletTransactionService.getMonthlyStats(wallet.id);

    return {
      walletId: wallet.id,
      balance: Number(wallet.balance),
      currency: wallet.currency || 'VND',
      monthlyDeposit,
      monthlySpent,
    };
  },

  createTopUpCheckout: async (
    userId: string,
    data: CreateTopUpCheckoutRequestDto
  ): Promise<CreateTopUpCheckoutResponse> => {
    const { amount, paymentMethod, description } = data;

    if (amount <= 0) {
      throw new BadRequestError(WALLET_MESSAGES.AMOUNT_MUST_BE_POSITIVE);
    }

    if (!config.sepay.merchantId || !config.sepay.secretKey) {
      throw new BadRequestError(WALLET_MESSAGES.TOP_UP_NOT_CONFIGURED);
    }

    const wallet = await walletRepository.getOrCreate(userId);
    const invoiceNumber = generateInvoiceNumber();

    const successUrl =
      config.sepay.successUrl || buildSuccessCallbackUrl(invoiceNumber);
    const errorUrl =
      config.sepay.errorUrl || buildErrorCallbackUrl(invoiceNumber);
    const cancelUrl =
      config.sepay.cancelUrl || buildCancelCallbackUrl(invoiceNumber);

    const topUpRequest = await walletTopUpRequestRepository.create({
      walletId: wallet.id,
      invoiceNumber,
      amount,
      currency: 'VND',
      paymentMethod: paymentMethod || 'BANK_TRANSFER',
      description,
    });

    const notificationUrl = buildIpnUrl();

    const checkoutFields = sepayService.createCheckoutFields({
      paymentMethod: paymentMethod || 'BANK_TRANSFER',
      invoiceNumber,
      amount,
      currency: 'VND',
      orderDescription: description || `Top-up wallet ${invoiceNumber}`,
      customerId: userId,
      notificationUrl,
      successUrl,
      errorUrl,
      cancelUrl,
      customData: JSON.stringify({
        top_up_request_id: topUpRequest.id,
        user_id: userId,
      }),
    });

    return {
      topUpRequestId: topUpRequest.id,
      invoiceNumber,
      amount: Number(topUpRequest.amount),
      currency: topUpRequest.currency,
      status: 'PENDING',
      checkoutUrl: sepayService.buildCheckoutUrl(),
      checkoutFields,
      expiresInMinutes: TOP_UP_EXPIRES_IN_MINUTES,
      createdAt: topUpRequest.createdAt,
    };
  },

  getTopUpStatus: async (
    userId: string,
    invoiceNumber: string
  ): Promise<TopUpStatusResponse> => {
    const topUpRequest = await walletTopUpRequestRepository.findByInvoiceNumber(
      invoiceNumber,
      true
    );

    if (!topUpRequest || topUpRequest.wallet.userId !== userId) {
      throw new NotFoundError(WALLET_MESSAGES.TOP_UP_REQUEST_NOT_FOUND);
    }

    const transaction = await walletTransactionService.findByReferenceId(
      topUpRequest.invoiceNumber
    );

    return {
      topUpRequestId: topUpRequest.id,
      invoiceNumber: topUpRequest.invoiceNumber,
      amount: Number(topUpRequest.amount),
      currency: topUpRequest.currency,
      status: topUpRequest.status,
      transactionId: transaction?.id,
      paidAt: topUpRequest.paidAt || undefined,
      createdAt: topUpRequest.createdAt,
      updatedAt: topUpRequest.updatedAt,
    };
  },

  processTopUpIpn: async (
    sepaySecretKey: string | undefined,
    payload: SePayIpnPayload
  ) => {
    if (!config.sepay.secretKey) {
      throw new BadRequestError(WALLET_MESSAGES.TOP_UP_NOT_CONFIGURED);
    }

    if (!sepayService.validateSePaySecretKey(sepaySecretKey)) {
      throw new UnauthorizedError(WALLET_MESSAGES.TOP_UP_IPN_UNAUTHORIZED);
    }

    const invoiceNumber = payload.order?.order_invoice_number;
    const customData = parseCustomData(
      payload.custom_data || payload.order?.custom_data
    );
    const topUpRequestId =
      typeof customData?.top_up_request_id === 'string'
        ? customData.top_up_request_id
        : undefined;
    const userId =
      typeof customData?.user_id === 'string' ? customData.user_id : undefined;

    if (!invoiceNumber) {
      throw new BadRequestError('IPN thiếu order_invoice_number');
    }

    const topUpRequest = await walletTopUpRequestRepository.findByInvoiceNumber(
      invoiceNumber,
      true
    );

    if (!topUpRequest) {
      return {
        acknowledged: true,
        ignored: true,
        invoiceNumber,
      };
    }

    if (topUpRequestId && topUpRequest.id !== topUpRequestId) {
      return {
        acknowledged: true,
        ignored: true,
        invoiceNumber,
        reason: 'custom_data top_up_request_id mismatch',
      };
    }

    if (userId && topUpRequest.wallet.userId !== userId) {
      return {
        acknowledged: true,
        ignored: true,
        invoiceNumber,
        reason: 'custom_data user_id mismatch',
      };
    }

    if (payload.notification_type === 'ORDER_PAID') {
      if (topUpRequest.status === 'PAID') {
        return {
          acknowledged: true,
          invoiceNumber,
          status: 'PAID',
          duplicate: true,
        };
      }

      const ipnAmount =
        toNumber(payload.transaction?.transaction_amount) ||
        toNumber(payload.order?.order_amount);
      const creditAmount =
        ipnAmount > 0 ? ipnAmount : Number(topUpRequest.amount);

      const wasCredited = await walletTransactionService.creditWallet({
        walletId: topUpRequest.walletId,
        amount: creditAmount,
        referenceId: invoiceNumber,
        transactionType: 'DEPOSIT',
      });

      await walletTopUpRequestRepository.update(topUpRequest.id, {
        status: 'PAID',
        paidAt: topUpRequest.paidAt || new Date(),
        sepayOrderId: payload.order?.order_id,
        sepayTransactionId: payload.transaction?.transaction_id,
        rawIpn: payload as unknown as object,
      });

      return {
        acknowledged: true,
        invoiceNumber,
        status: 'PAID',
        wasCredited,
      };
    }

    if (
      payload.notification_type === 'TRANSACTION_VOID' &&
      topUpRequest.status === 'PENDING'
    ) {
      await walletTopUpRequestRepository.update(topUpRequest.id, {
        status: 'FAILED',
        rawIpn: payload as unknown as object,
      });
    }

    return {
      acknowledged: true,
      invoiceNumber,
      status: topUpRequest.status,
      notificationType: payload.notification_type,
    };
  },

  handleTopUpCallback: async (
    status: TopUpCallbackStatus,
    invoiceNumber?: string
  ) => {
    if (status === 'cancel' && invoiceNumber) {
      await walletTopUpRequestRepository.updateManyByStatus(
        invoiceNumber,
        'PENDING',
        {
          status: 'CANCELLED',
        }
      );
    }

    return {
      status,
      invoiceNumber,
    };
  },

  getTransactionHistory: async (
    userId: string,
    query: GetTransactionHistoryQueryDto
  ): Promise<TransactionHistoryResponse> => {
    const { page = 1, limit = 10, transactionType } = query;

    const wallet = await walletRepository.getOrCreate(userId);

    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;

    const skip = (pageNum - 1) * limitNum;

    const transactions = await walletTransactionRepository.findByWalletId(
      wallet.id,
      {
        skip,
        take: limitNum,
        transactionType,
      }
    );

    const total = await walletTransactionRepository.countByWalletId(
      wallet.id,
      transactionType
    );

    const totalPages = Math.ceil(total / limitNum);

    return {
      transactions: transactions.map(
        (tx: {
          id: string;
          transactionType: string;
          amount: unknown;
          referenceId: string;
          createdAt: Date;
        }) => ({
          id: tx.id,
          transactionType: tx.transactionType,
          amount: Number(tx.amount),
          referenceId: tx.referenceId,
          createdAt: tx.createdAt,
        })
      ),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    };
  },

  getTransactionById: async (userId: string, transactionId: string) => {
    const transaction =
      await walletTransactionRepository.findById(transactionId);

    if (!transaction) {
      throw new NotFoundError(WALLET_MESSAGES.TRANSACTION_NOT_FOUND);
    }

    if (transaction.wallet.userId !== userId) {
      throw new NotFoundError(WALLET_MESSAGES.TRANSACTION_NOT_FOUND);
    }

    return {
      id: transaction.id,
      transactionType: transaction.transactionType,
      amount: Number(transaction.amount),
      referenceId: transaction.referenceId,
      createdAt: transaction.createdAt,
      wallet: {
        id: transaction.wallet.id,
        balance: Number(transaction.wallet.balance),
        currency: transaction.wallet.currency,
      },
    };
  },
};

export default walletService;
