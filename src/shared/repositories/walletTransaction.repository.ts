import { prisma } from '@/utils/prisma.js';
import type { Prisma, TransactionType } from 'generated/prisma/index.js';

export interface CreateWalletTransactionParams {
  walletId: string;
  transactionType: TransactionType;
  amount: number;
  referenceId: string;
}

const walletTransactionRepository = {
  create: async (
    data: CreateWalletTransactionParams,
    tx?: Prisma.TransactionClient
  ) => {
    const client = (tx || prisma) as Prisma.TransactionClient;
    return await client.walletTransaction.create({
      data: {
        walletId: data.walletId,
        transactionType: data.transactionType,
        amount: data.amount,
        referenceId: data.referenceId,
      },
    });
  },

  findByWalletId: async (
    walletId: string,
    options?: {
      skip?: number;
      take?: number;
      transactionType?: TransactionType;
    }
  ) => {
    const where: Prisma.WalletTransactionWhereInput = {
      walletId,
      deletedAt: null,
    };

    if (options?.transactionType) {
      where.transactionType = options.transactionType;
    }

    return await prisma.walletTransaction.findMany({
      where,
      skip: options?.skip || 0,
      take: options?.take || 10,
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  countByWalletId: async (
    walletId: string,
    transactionType?: TransactionType
  ) => {
    const where: Prisma.WalletTransactionWhereInput = {
      walletId,
      deletedAt: null,
    };

    if (transactionType) {
      where.transactionType = transactionType;
    }

    return await prisma.walletTransaction.count({ where });
  },

  findById: async (id: string) => {
    return await prisma.walletTransaction.findUnique({
      where: { id },
      include: {
        wallet: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  },

  findByReferenceId: async (
    referenceId: string,
    tx?: Prisma.TransactionClient
  ) => {
    const client = (tx || prisma) as Prisma.TransactionClient;
    return await client.walletTransaction.findFirst({
      where: {
        referenceId,
        deletedAt: null,
      },
    });
  },

  findByWalletIdAndDateRange: async (
    walletId: string,
    startDate: Date,
    endDate: Date
  ) => {
    return await prisma.walletTransaction.findMany({
      where: {
        walletId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        deletedAt: null,
      },
      select: {
        transactionType: true,
        amount: true,
      },
    });
  },
};

export default walletTransactionRepository;
