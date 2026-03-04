import { prisma } from '@/utils/prisma.js';

class OrderRepository {
  async findActiveOrderByConsumer(consumerId: string) {
    return prisma.order.findFirst({
      where: {
        consumerId: consumerId,
        status: 'PENDING',
        deletedAt: null,
      },
    });
  }

  async create(data: {
    id: string;
    consumer_id: string;
    store_id: string;
    order_type: 'INSTORE' | 'DELIVERY';
    status: 'PENDING' | 'PAID' | 'PREPARING';
    total_amount: number;
  }) {
    return prisma.order.create({
      data: {
        id: data.id,
        consumerId: data.consumer_id,
        storeId: data.store_id,
        orderType: data.order_type,
        status: data.status,
        totalAmount: data.total_amount,
        updatedAt: new Date(),
      },
    });
  }
}

export default new OrderRepository();
