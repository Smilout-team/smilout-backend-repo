import walletTransactionRepository from '@/shared/repositories/walletTransaction.repository.js';
import { prisma } from '@/utils/prisma.js';
import type {
  Prisma,
  TransactionType,
} from '../../../../generated/prisma/index.js';

export interface CreditWalletParams {
  walletId: string;
  amount: number;
  referenceId: string;
  transactionType?: TransactionType;
}

export interface MonthlyStats {
  monthlyDeposit: number;
  monthlySpent: number;
}

const walletTransactionService = {
  getMonthlyStats: async (walletId: string): Promise<MonthlyStats> => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const transactions =
      await walletTransactionRepository.findByWalletIdAndDateRange(
        walletId,
        startOfMonth,
        endOfMonth
      );

    let monthlyDeposit = 0;
    let monthlySpent = 0;

    transactions.forEach(
      (tx: {
        transactionType:
          | 'DEPOSIT'
          | 'PURCHASE'
          | 'REFUND'
          | 'SUBSCRIPTION_PAYMENT';
        amount: unknown;
      }) => {
        const amount = Number(tx.amount);
        if (tx.transactionType === 'DEPOSIT') {
          monthlyDeposit += amount;
        } else {
          monthlySpent += amount;
        }
      }
    );

    return { monthlyDeposit, monthlySpent };
  },

  creditWallet: async (params: CreditWalletParams): Promise<boolean> => {
    const {
      walletId,
      amount,
      referenceId,
      transactionType = 'DEPOSIT',
    } = params;

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existingTransaction =
        await walletTransactionRepository.findByReferenceId(referenceId, tx);

      if (existingTransaction) {
        return false;
      }

      await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      await walletTransactionRepository.create(
        {
          walletId,
          transactionType,
          amount,
          referenceId,
        },
        tx
      );

      return true;
    });
  },

  findByReferenceId: async (referenceId: string) => {
    return await walletTransactionRepository.findByReferenceId(referenceId);
  },
};

export default walletTransactionService;
