import { prisma } from '@/utils/prisma.js';

const fraudAlertRepository = {
  countActiveByStore: async (storeId: string) => {
    return prisma.fraudAlert.count({
      where: {
        storeId,
        status: 'PENDING',
        deletedAt: null,
      },
    });
  },
};

export default fraudAlertRepository;
