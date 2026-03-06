import { prisma } from '@/utils/prisma.js';

const productRepository = {
  findById: async (id: string) => {
    return await prisma.product.findUnique({
      where: { id, deletedAt: null },
    });
  },
};

export default productRepository;
