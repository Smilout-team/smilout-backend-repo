import { Router } from 'express';
import { validate } from '@/middlewares/validate.middleware.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import { walletController } from './wallet.controller.js';
import {
  createTopUpCheckoutSchema,
  getTopUpStatusSchema,
  getTransactionByIdSchema,
  getTransactionHistorySchema,
} from './schemas/wallet.schema.js';

const walletRoutes = Router();

walletRoutes.use(authMiddleware);

walletRoutes.get('/balance', walletController.getBalance);

walletRoutes.post(
  '/top-up',
  validate(createTopUpCheckoutSchema),
  walletController.createTopUpCheckout
);

walletRoutes.get(
  '/top-up/:invoiceNumber',
  validate(getTopUpStatusSchema),
  walletController.getTopUpStatus
);

walletRoutes.get(
  '/transactions',
  validate(getTransactionHistorySchema),
  walletController.getTransactionHistory
);

walletRoutes.get(
  '/transactions/:transactionId',
  validate(getTransactionByIdSchema),
  walletController.getTransactionById
);

export default walletRoutes;
