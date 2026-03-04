import { prisma } from '@/utils/prisma.js';

const walletRepository = {
  findByUserId: async (userId: string) => {
    return await prisma.wallet.findFirst({
      where: { userId, deletedAt: null },
    });
  },

  create: async (userId: string, currency: string = 'VND') => {
    return await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        currency,
      },
    });
  },

  getOrCreate: async (userId: string, currency: string = 'VND') => {
    let wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      wallet = await walletRepository.create(userId, currency);
    }
    return wallet;
  },
};

export default walletRepository;
