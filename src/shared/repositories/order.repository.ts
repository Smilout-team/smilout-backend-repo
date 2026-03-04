import type { CreateOrderParams } from '@/shared/dtos/repositories/order.repository.dto.js';
import { prisma } from '@/utils/prisma.js';
import { Prisma, type OrderItem } from 'generated/prisma/index.js';

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
  
  findProductByBarcode(barcode: string) {
    return prisma.product.findFirst({
      where: { barcode },
    });
  },

  findActiveCart(userId: string) {
    return prisma.order.findFirst({
      where: {
        consumerId,
        status: 'PENDING',
      },
    });
  },

  createCart(userId: string, storeId: string) {
    return prisma.order.create({
      data: {
        consumerId,
        storeId,
        orderType: 'INSTORE',
        status: 'PENDING',
        totalAmount: new Prisma.Decimal(0),
      },
    });
  },

  updateOrderTotal(orderId: string, total: Prisma.Decimal) {
    return prisma.order.update({
      where: { id: orderId },
      data: { totalAmount: total },
    });
  },

  findOrderItem(orderId: string, productId: string) {
    return prisma.orderItem.findFirst({
      where: {
        orderId,
        productId,
      },
    });
  },

  findOrderItems(orderId: string): Promise<OrderItem[]> {
    return prisma.orderItem.findMany({
      where: { orderId },
    });
  },

  createOrderItem(orderId: string, productId: string, price: number) {
    return prisma.orderItem.create({
      data: {
        orderId,
        productId,
        quantity: 1,
        priceAtPurchase: new Prisma.Decimal(price),
      },
    });
  },

  updateOrderItemQuantity(orderItemId: string, quantity: number) {
    return prisma.orderItem.update({
      where: { id: orderItemId },
      data: { quantity },
    });
  },

  deleteOrderItem(orderItemId: string) {
    return prisma.orderItem.delete({
      where: { id: orderItemId },
    });
  }
};

export default orderRepository;
