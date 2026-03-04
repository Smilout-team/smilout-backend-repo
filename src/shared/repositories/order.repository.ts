import { prisma } from '@/utils/prisma.js';
import { Prisma, type OrderItem } from '../../../generated/prisma/index.js';
import { BadRequestError } from '@/core/apiError.js';

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

  findOrderItems(orderId: string): Promise<
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

  createPaymentTransaction: async (data: {
    userId: string;
    storeId: string;
    totalAmount: number;
    items: { productId: string; quantity: number; priceAtPurchase: number }[];
  }) => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const wallet = await tx.wallet.findFirst({
        where: { userId: data.userId },
      });

      if (!wallet) {
        throw new BadRequestError('Ví người dùng không tồn tại.');
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: data.totalAmount },
        },
      });

      for (const item of data.items) {
        await tx.product.update({
          where: {
            id: item.productId,
            stockQuantity: { gte: item.quantity },
          },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });
      }

      const newOrder = await tx.order.create({
        data: {
          consumerId: data.userId,
          storeId: data.storeId,
          orderType: 'INSTORE',
          totalAmount: data.totalAmount,
          status: 'PAID',

          orderItems: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtPurchase,
            })),
          },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: data.totalAmount,
          transactionType: 'PURCHASE' as any,
          referenceId: `ORDER-${newOrder.id}`,
        },
      });

      return newOrder;
    });
  },
};

export default orderRepository;
