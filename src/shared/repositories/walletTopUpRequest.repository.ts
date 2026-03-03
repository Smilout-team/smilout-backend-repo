import { prisma } from '@/utils/prisma.js';

export interface CreateTopUpRequestData {
  walletId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  description?: string;
}

export interface UpdateTopUpRequestData {
  status?: string;
  paidAt?: Date;
  sepayOrderId?: string;
  sepayTransactionId?: string;
  rawIpn?: any;
}

const walletTopUpRequestRepository = {
  create: async (data: CreateTopUpRequestData) => {
    return prisma.walletTopUpRequest.create({ data });
  },

  findByInvoiceNumber: async (invoiceNumber: string, includeWallet = false) => {
    return prisma.walletTopUpRequest.findFirst({
      where: {
        invoiceNumber,
        deletedAt: null,
      },
      include: includeWallet ? { wallet: true } : undefined,
    });
  },

  update: async (id: string, data: UpdateTopUpRequestData) => {
    return prisma.walletTopUpRequest.update({
      where: { id },
      data,
    });
  },

  updateManyByStatus: async (
    invoiceNumber: string,
    currentStatus: string,
    newData: UpdateTopUpRequestData
  ) => {
    return prisma.walletTopUpRequest.updateMany({
      where: {
        invoiceNumber,
        status: currentStatus,
        deletedAt: null,
      },
      data: newData,
    });
  },
};

export default walletTopUpRequestRepository;
