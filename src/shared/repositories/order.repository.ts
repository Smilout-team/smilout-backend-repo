import { prisma } from '@/utils/prisma.js';
import { Prisma, type OrderItem } from 'generated/prisma/index.js';

const orderRepository = {
  findProductByBarcode(barcode: string, storeId: string) {
    return prisma.product.findFirst({
      where: {
        barcode,
        storeId,
      },
    });
  },

  findProductById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
    });
  },

  findActiveCart(consumerId: string) {
    return prisma.order.findFirst({
      where: {
        consumerId,
        status: 'PENDING',
      },
    });
  },

  create(data: {
    consumerId: string;
    storeId: string;
    orderType: string;
    status: string;
    totalAmount: number;
  }) {
    return prisma.order.create({
      data: {
        consumerId: data.consumerId,
        storeId: data.storeId,
        orderType: data.orderType,
        status: data.status,
        totalAmount: new Prisma.Decimal(data.totalAmount),
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

  findOrderItemById(itemId: string) {
    return prisma.orderItem.findUnique({
      where: { id: itemId },
    });
  },

  findOrderItems(
    orderId: string
  ): Promise<
    (OrderItem & {
      product?: {
        name: string;
        imageUrls: string[];
        description: string;
        stockQuantity: number;
        expiryDate: Date | null;
        category: { name: string | null } | null;
      } | null;
    })[]
  > {
    return prisma.orderItem.findMany({
      where: { orderId },
      include: {
        product: {
          select: {
            name: true,
            imageUrls: true,
            description: true,
            stockQuantity: true,
            expiryDate: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
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
  },

  decreaseProductStock(productId: string, quantity: number = 1) {
    return prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: {
          decrement: quantity,
        },
      },
    });
  },

  increaseProductStock(productId: string, quantity: number = 1) {
    return prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: {
          increment: quantity,
        },
      },
    });
  },
};

export default orderRepository;
