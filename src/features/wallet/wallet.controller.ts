import type { Request, Response } from 'express';
import { catchAsync } from '@/utils/catchAsync.js';
import walletService from './wallet.service.js';
import { ApiResponse } from '@/core/apiResponse.js';
import { WALLET_MESSAGES } from './wallet.messages.js';
import { config } from '@/config/index.js';
import type {
  CreateTopUpCheckoutRequestDto,
  GetTransactionHistoryQueryDto,
} from './dtos/walletRequest.dto.js';

export const walletController = {
  getBalance: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const walletBalance = await walletService.getWalletBalance(userId);

    const response = ApiResponse.success(
      WALLET_MESSAGES.WALLET_BALANCE_RETRIEVED,
      walletBalance
    );
    return res.status(response.statusCode).json(response);
  }),

  createTopUpCheckout: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data: CreateTopUpCheckoutRequestDto = req.body;
    const result = await walletService.createTopUpCheckout(userId, data);

    const response = ApiResponse.success(
      WALLET_MESSAGES.TOP_UP_CHECKOUT_CREATED,
      result
    );
    return res.status(response.statusCode).json(response);
  }),

  getTopUpStatus: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const invoiceNumber = req.params.invoiceNumber as string;

    const result = await walletService.getTopUpStatus(userId, invoiceNumber);

    const response = ApiResponse.success(
      WALLET_MESSAGES.TOP_UP_STATUS_RETRIEVED,
      result
    );
    return res.status(response.statusCode).json(response);
  }),

  handleTopUpIpn: catchAsync(async (req: Request, res: Response) => {
    const result = await walletService.processTopUpIpn(
      req.header('X-Secret-Key') || undefined,
      req.body
    );

    const response = ApiResponse.success(
      WALLET_MESSAGES.TOP_UP_IPN_PROCESSED,
      result
    );
    return res.status(response.statusCode).json(response);
  }),

  topUpSuccessCallback: catchAsync(async (req: Request, res: Response) => {
    const invoiceNumber = req.query.invoiceNumber as string | undefined;

    if (invoiceNumber && req.query.redirect !== 'false') {
      const frontendUrl = config.sepay.frontendRedirectUrl;
      if (frontendUrl) {
        walletService
          .handleTopUpCallback('success', invoiceNumber)
          .catch((err) => {
            console.error('Error updating top-up callback status:', err);
          });

        const redirectUrl = `${frontendUrl}?status=success&invoiceNumber=${invoiceNumber}`;
        return res.redirect(redirectUrl);
      }
    }

    const result = await walletService.handleTopUpCallback(
      'success',
      invoiceNumber
    );
    const response = ApiResponse.success('Payment success', result);
    return res.status(response.statusCode).json(response);
  }),

  topUpErrorCallback: catchAsync(async (req: Request, res: Response) => {
    const invoiceNumber = req.query.invoiceNumber as string | undefined;

    if (invoiceNumber && req.query.redirect !== 'false') {
      const frontendUrl = config.sepay.frontendRedirectUrl;
      if (frontendUrl) {
        walletService
          .handleTopUpCallback('error', invoiceNumber)
          .catch((err) => {
            console.error('Error updating top-up callback status:', err);
          });

        const redirectUrl = `${frontendUrl}?status=error&invoiceNumber=${invoiceNumber}`;
        return res.redirect(redirectUrl);
      }
    }

    const result = await walletService.handleTopUpCallback(
      'error',
      invoiceNumber
    );
    const response = ApiResponse.success('Payment error', result);
    return res.status(response.statusCode).json(response);
  }),

  topUpCancelCallback: catchAsync(async (req: Request, res: Response) => {
    const invoiceNumber = req.query.invoiceNumber as string | undefined;

    if (invoiceNumber && req.query.redirect !== 'false') {
      const frontendUrl = config.sepay.frontendRedirectUrl;
      if (frontendUrl) {
        walletService
          .handleTopUpCallback('cancel', invoiceNumber)
          .catch((err) => {
            console.error('Error updating top-up callback status:', err);
          });

        const redirectUrl = `${frontendUrl}?status=cancel&invoiceNumber=${invoiceNumber}`;
        return res.redirect(redirectUrl);
      }
    }

    const result = await walletService.handleTopUpCallback(
      'cancel',
      invoiceNumber
    );
    const response = ApiResponse.success('Payment canceled', result);
    return res.status(response.statusCode).json(response);
  }),

  getTransactionHistory: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const query: GetTransactionHistoryQueryDto = req.query;

    const history = await walletService.getTransactionHistory(userId, query);

    const response = ApiResponse.paginated(
      WALLET_MESSAGES.TRANSACTION_HISTORY_RETRIEVED,
      history.transactions,
      {
        currentPage: history.pagination.page,
        limit: history.pagination.limit,
        totalItems: history.pagination.total,
      }
    );
    return res.status(response.statusCode).json(response);
  }),

  getTransactionById: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const transactionId = req.params.transactionId as string;

    const transaction = await walletService.getTransactionById(
      userId,
      transactionId
    );

    const response = ApiResponse.success(
      WALLET_MESSAGES.TRANSACTION_DETAILS_RETRIEVED,
      transaction
    );
    return res.status(response.statusCode).json(response);
  }),
};
