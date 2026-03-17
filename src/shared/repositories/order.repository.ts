import { prisma } from '@/utils/prisma.js';
import { Prisma } from '../../../generated/prisma/index.js';
import { BadRequestError } from '@/core/apiError.js';
import type {
  CreateOrderParams,
  CompletePaymentTransactionParams,
  OrderItemWithProduct,
} from '@/shared/dtos/repositories/order.repository.dto.js';

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
        orderType: 'INSTORE',
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  findActiveCartForDelivery(consumerId: string) {
    return prisma.order.findFirst({
      where: {
        consumerId,
        status: 'PENDING',
        orderType: 'DELIVERY',
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  findPendingCartById(consumerId: string, orderId: string) {
    return prisma.order.findFirst({
      where: {
        id: orderId,
        consumerId,
        status: 'PENDING',
        deletedAt: null,
      },
      include: {
        store: {
          select: {
            id: true,
            coordinate: true,
          },
        },
      },
    });
  },

  findPendingCartByStore(consumerId: string, storeId: string) {
    return prisma.order.findFirst({
      where: {
        storeId,
        consumerId,
        status: 'PENDING',
        deletedAt: null,
      },
    });
  },

  clearPendingCartsByConsumer(consumerId: string) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const pendingOrders = await tx.order.findMany({
        where: {
          consumerId,
          status: 'PENDING',
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

      if (pendingOrders.length === 0) {
        return;
      }

      const pendingOrderIds = pendingOrders.map((order) => order.id);

      const pendingItems = await tx.orderItem.findMany({
        where: {
          orderId: { in: pendingOrderIds },
          deletedAt: null,
        },
        select: {
          productId: true,
          quantity: true,
        },
      });

      const restoreQuantityMap = new Map<string, number>();
      for (const item of pendingItems) {
        restoreQuantityMap.set(
          item.productId,
          (restoreQuantityMap.get(item.productId) ?? 0) + item.quantity
        );
      }

      for (const [productId, quantity] of restoreQuantityMap.entries()) {
        await tx.product.update({
          where: { id: productId },
          data: {
            stockQuantity: {
              increment: quantity,
            },
          },
        });
      }

      const now = new Date();

      await tx.orderItem.updateMany({
        where: {
          orderId: { in: pendingOrderIds },
          deletedAt: null,
        },
        data: {
          deletedAt: now,
        },
      });

      await tx.order.updateMany({
        where: {
          id: { in: pendingOrderIds },
          deletedAt: null,
        },
        data: {
          deletedAt: now,
        },
      });
    });
  },

  create(data: CreateOrderParams) {
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

  findOrderItems(orderId: string): Promise<OrderItemWithProduct[]> {
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

  createOrderItemWithQuantity(
    orderId: string,
    productId: string,
    price: number,
    quantity: number
  ) {
    return prisma.orderItem.create({
      data: {
        orderId,
        productId,
        quantity,
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

  completePaymentTransaction: async (
    data: CompletePaymentTransactionParams
  ) => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const wallet = await tx.wallet.findFirst({
        where: { userId: data.consumerId, deletedAt: null },
      });

      if (!wallet) {
        throw new BadRequestError('Ví người dùng không tồn tại.');
      }

      const walletUpdateResult = await tx.wallet.updateMany({
        where: {
          id: wallet.id,
          balance: {
            gte: new Prisma.Decimal(data.totalAmount),
          },
        },
        data: {
          balance: { decrement: data.totalAmount },
        },
      });

      if (walletUpdateResult.count === 0) {
        throw new BadRequestError(data.insufficientBalanceMessage);
      }

      const updatedOrderResult = await tx.order.updateMany({
        where: {
          id: data.orderId,
          consumerId: data.consumerId,
          status: 'PENDING',
          deletedAt: null,
        },
        data: {
          status: data.nextStatus,
          totalAmount: data.totalAmount,
          deliveryAddress: data.deliveryAddress,
          deliveryPhoneNumber: data.deliveryPhoneNumber,
          deliveryOption: data.deliveryOption,
          scheduledDeliveryAt: data.scheduledDeliveryAt,
        },
      });

      if (updatedOrderResult.count === 0) {
        throw new BadRequestError(data.invalidOrderMessage);
      }

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: data.totalAmount,
          transactionType: 'PURCHASE',
          referenceId: `ORDER-${data.orderId}`,
        },
      });

      return tx.order.findUniqueOrThrow({
        where: { id: data.orderId },
      });
    });
  },

  findOrderById(orderId: string) {
    return prisma.order.findFirst({
      where: {
        id: orderId,
        deletedAt: null,
      },
      include: {
        store: {
          select: {
            id: true,
            storeName: true,
            address: true,
            coordinate: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                barcode: true,
                originalPrice: true,
                discountingPrice: true,
                stockQuantity: true,
                imageUrls: true,
              },
            },
          },
        },
      },
    });
  },

  findOrdersByConsumer(consumerId: string) {
    return prisma.order.findMany({
      where: {
        consumerId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        store: {
          select: {
            id: true,
            storeName: true,
            address: true,
          },
        },
        orderItems: {
          select: {
            quantity: true,
            priceAtPurchase: true,
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  },

  findAllStoresWithProducts(productBarcodes: string[]) {
    return prisma.store.findMany({
      where: {
        deletedAt: null,
        products: {
          some: {
            barcode: {
              in: productBarcodes,
            },
            deletedAt: null,
            isAvailable: true,
          },
        },
      },
      include: {
        products: {
          where: {
            barcode: {
              in: productBarcodes,
            },
            deletedAt: null,
            isAvailable: true,
          },
          select: {
            id: true,
            name: true,
            barcode: true,
            originalPrice: true,
            discountingPrice: true,
            stockQuantity: true,
          },
        },
      },
    });
  },

  findStoreById(storeId: string) {
    return prisma.store.findFirst({
      where: {
        id: storeId,
        deletedAt: null,
      },
    });
  },

  findProductsByBarcodesInStore(storeId: string, barcodes: string[]) {
    return prisma.product.findMany({
      where: {
        storeId,
        barcode: {
          in: barcodes,
        },
        isAvailable: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        barcode: true,
        originalPrice: true,
        discountingPrice: true,
        stockQuantity: true,
      },
    });
  },

  findStaffByUserId(userId: string) {
    return prisma.storeStaff.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        userId: true,
        storeId: true,
      },
    });
  },

  findOrdersByStore(storeId: string) {
    return prisma.order.findMany({
      where: {
        storeId,
        orderType: 'DELIVERY',
        status: {
          in: ['PENDING', 'PREPARING', 'PAID', 'COMPLETED', 'REJECTED'],
        },
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        consumer: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrls: true,
              },
            },
          },
        },
      },
    });
  },

  findNewOrderByStore(storeId: string) {
    return prisma.order.findFirst({
      where: {
        storeId,
        orderType: 'DELIVERY',
        status: {
          in: ['PAID'],
        },
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        consumer: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrls: true,
              },
            },
          },
        },
      },
    });
  },

  updateOrderStatus(
    orderId: string,
    status: 'PENDING' | 'PREPARING' | 'PAID' | 'COMPLETED' | 'REJECTED'
  ) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  },
};

export default orderRepository;
