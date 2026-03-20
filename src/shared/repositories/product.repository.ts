import { prisma } from '@/utils/prisma.js';

const productRepository = {
  findById: async (id: string) => {
    return await prisma.product.findUnique({
      where: { id, deletedAt: null },
    });
  },

  findByStoreId: async (storeId: string) => {
    return await prisma.product.findMany({
      where: {
        storeId,
        deletedAt: null,
        isAvailable: true,
      },
      orderBy: { name: 'asc' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },
};

export default productRepository;
