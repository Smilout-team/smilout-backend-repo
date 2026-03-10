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

  async findActiveStoresWithCoordinates() {
    return prisma.store.findMany({
      where: {
        deletedAt: null,
        coordinate: {
          not: null,
        },
      },
      select: {
        id: true,
        storeName: true,
        address: true,
        coordinate: true,
      },
    });
  }
}

export default new StoreRepository();
