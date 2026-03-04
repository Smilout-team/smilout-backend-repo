import type { CreateOrderParams } from '@/shared/dtos/repositories/order.repository.dto.js';
import { prisma } from '@/utils/prisma.js';

const orderRepository = {
  findActiveOrderByConsumer(consumerId: string) {
    return prisma.order.findFirst({
      where: {
        consumerId: consumerId,
        status: 'PENDING',
        deletedAt: null,
      },
    });
  },
  create: (data: CreateOrderParams) => {
    return prisma.order.create({
      data: {
        consumerId: data.consumerId,
        storeId: data.storeId,
        orderType: data.orderType,
        status: data.status,
        totalAmount: data.totalAmount,
        updatedAt: new Date(),
      },
    });
  },
};

export default orderRepository;
