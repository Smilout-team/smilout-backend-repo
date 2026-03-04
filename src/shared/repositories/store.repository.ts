import { prisma } from '@/utils/prisma.js';

class StoreRepository {
  async findById(id: string) {
    return prisma.store.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }
}

export default new StoreRepository();
