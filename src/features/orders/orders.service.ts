import { Prisma, type Order } from '../../../generated/prisma/index.js';
import orderRepository from '@/shared/repositories/order.repository.js';
import fraudAlertRepository from '@/shared/repositories/fraudAlert.repository.js';
import { ORDERS_MESSAGES } from './orders.messages.js';
import type {
  ScanProductRequestDto,
  ScanProductResponseDto,
  RepurchaseOrderRequestDto,
  RepurchaseOrderResponseDto,
  StoreRecommendation,
  ProductAvailability,
  OrderHistoryItemDto,
  RepurchaseToCartRequestDto,
  RepurchaseToCartResponseDto,
} from './dtos/index.js';
import { BadRequestError } from '@/core/apiError.js';
import {
  parseCoordinates,
  calculateDistance,
} from '@/shared/utils/coordinate.util.js';
import { calculateOrderTotal } from './utils/orderCalculation.util.js';

export const ordersService = {
  getMyOrders: async (userId: string): Promise<OrderHistoryItemDto[]> => {
    const orders: Awaited<
      ReturnType<typeof orderRepository.findOrdersByConsumer>
    > = await orderRepository.findOrdersByConsumer(userId);

    const successfulOrders = orders.filter(
      (order: { status: string }) =>
        order.status === 'PAID' ||
        order.status === 'PREPARING' ||
        order.status === 'COMPLETED'
    );

    return successfulOrders.map((order: (typeof orders)[number]) => ({
      id: order.id,
      orderType: order.orderType,
      status: order.status,
      deliveryAddress: order.deliveryAddress,
      deliveryOption: order.deliveryOption,
      scheduledDeliveryAt: order.scheduledDeliveryAt,
      createdAt: order.createdAt,
      totalAmount: Number(order.totalAmount),
      store: {
        id: order.store.id,
        storeName: order.store.storeName,
        address: order.store.address,
      },
      totalItems: order.orderItems.reduce(
        (sum: number, item: { quantity: number }) => sum + item.quantity,
        0
      ),
      items: order.orderItems.map((item: any) => ({
        productName: item.product.name,
        quantity: item.quantity,
        priceAtPurchase: Number(item.priceAtPurchase),
      })),
    }));
  },

  scanProduct: async (
    userId: string,
    payload: ScanProductRequestDto
  ): Promise<ScanProductResponseDto> => {
    const { barcode } = payload;

    const cart = await orderRepository.findActiveCart(userId);
    if (!cart) {
      throw new BadRequestError(ORDERS_MESSAGES.NO_ACTIVE_CART);
    }

    const product = await orderRepository.findProductByBarcode(
      barcode,
      cart.storeId
    );

    if (!product) {
      throw new BadRequestError(ORDERS_MESSAGES.PRODUCT_NOT_FOUND);
    }

    if (product.stockQuantity < 1) {
      throw new BadRequestError(ORDERS_MESSAGES.OUT_OF_STOCK);
    }

    const existingItem = await orderRepository.findOrderItem(
      cart.id,
      product.id
    );

    if (existingItem) {
      await orderRepository.updateOrderItemQuantity(
        existingItem.id,
        existingItem.quantity + 1
      );
    } else {
      const price = product.discountingPrice ?? product.originalPrice;

      await orderRepository.createOrderItem(cart.id, product.id, Number(price));
    }

    await orderRepository.decreaseProductStock(product.id, 1);

    const items = await orderRepository.findOrderItems(cart.id);
    const total = calculateOrderTotal(items);
    await orderRepository.updateOrderTotal(cart.id, total);

    const updatedItem = await orderRepository.findOrderItem(
      cart.id,
      product.id
    );

    return {
      message: ORDERS_MESSAGES.SCAN_SUCCESS,
      productId: product.id,
      quantity: updatedItem!.quantity,
    };
  },

  getOrderItems: async (orderId: string) => {
    const items = await orderRepository.findOrderItems(orderId);

    if (!items) {
      throw new BadRequestError(ORDERS_MESSAGES.NO_ACTIVE_CART);
    }

    return items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      name: item.product?.name ?? 'Không xác định',
      price: Number(item.priceAtPurchase),
      quantity: item.quantity,
      imageUrls: item.product?.imageUrls ?? [],
      description: item.product?.description ?? '',
      stockQuantity: item.product?.stockQuantity ?? 0,
      expiryDate: item.product?.expiryDate ?? null,
      category: item.product?.category?.name ?? 'Chưa phân loại',
    }));
  },

  deleteOrderItem: async (orderId: string, itemId: string) => {
    const item = await orderRepository.findOrderItemById(itemId);

    if (!item || item.orderId !== orderId) {
      throw new BadRequestError(ORDERS_MESSAGES.ITEM_NOT_FOUND);
    }

    await orderRepository.increaseProductStock(item.productId, item.quantity);

    await orderRepository.deleteOrderItem(itemId);

    const items = await orderRepository.findOrderItems(orderId);
    const total = calculateOrderTotal(items);
    await orderRepository.updateOrderTotal(orderId, total);

    return {
      message: ORDERS_MESSAGES.DELETE_SUCCESS,
    };
  },

  updateOrderItemQuantity: async (
    orderId: string,
    itemId: string,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      throw new BadRequestError(ORDERS_MESSAGES.INVALID_QUANTITY);
    }

    const item = await orderRepository.findOrderItemById(itemId);

    if (!item || item.orderId !== orderId) {
      throw new BadRequestError(ORDERS_MESSAGES.ITEM_NOT_FOUND);
    }

    const product = await orderRepository.findProductById(item.productId);

    if (!product) {
      throw new BadRequestError(ORDERS_MESSAGES.PRODUCT_NOT_FOUND);
    }

    const quantityDifference = newQuantity - item.quantity;

    if (quantityDifference > 0 && product.stockQuantity < quantityDifference) {
      throw new BadRequestError(ORDERS_MESSAGES.EXCEED_STOCK);
    }

    if (quantityDifference > 0) {
      await orderRepository.decreaseProductStock(
        item.productId,
        quantityDifference
      );
    } else if (quantityDifference < 0) {
      await orderRepository.increaseProductStock(
        item.productId,
        Math.abs(quantityDifference)
      );
    }

    await orderRepository.updateOrderItemQuantity(itemId, newQuantity);

    const items = await orderRepository.findOrderItems(orderId);
    const total = calculateOrderTotal(items);
    await orderRepository.updateOrderTotal(orderId, total);

    const updatedItem = await orderRepository.findOrderItemById(itemId);

    return {
      message: ORDERS_MESSAGES.UPDATE_SUCCESS,
      updatedItem: {
        id: updatedItem!.id,
        productId: updatedItem!.productId,
        quantity: updatedItem!.quantity,
        price: Number(updatedItem!.priceAtPurchase),
      },
    };
  },

  repurchaseOrder: async (
    userId: string,
    payload: RepurchaseOrderRequestDto
  ): Promise<RepurchaseOrderResponseDto> => {
    type OriginalOrderProductData = {
      productName: string;
      quantity: number;
      originalPrice: number;
      discountedPrice: number;
    };

    type StoreProductData = {
      id: string;
      name: string;
      barcode: string;
      originalPrice: Prisma.Decimal;
      discountingPrice: Prisma.Decimal;
      stockQuantity: number;
    };

    const { orderId, userLatitude, userLongitude } = payload;

    const order = await orderRepository.findOrderById(orderId);

    if (!order) {
      throw new BadRequestError(ORDERS_MESSAGES.ORDER_NOT_FOUND);
    }

    if (order.consumerId !== userId) {
      throw new BadRequestError(ORDERS_MESSAGES.USER_NOT_PERMITTED);
    }

    if (!order.orderItems || order.orderItems.length === 0) {
      throw new BadRequestError(ORDERS_MESSAGES.ORDER_NOT_INCLUDE_ITEMS);
    }

    const productMap = new Map<string, OriginalOrderProductData>();
    for (const item of order.orderItems) {
      productMap.set(item.product.barcode, {
        productName: item.product.name,
        quantity: item.quantity,
        originalPrice: Number(item.product.originalPrice),
        discountedPrice: Number(item.product.discountingPrice),
      });
    }

    const productBarcodes = Array.from(productMap.keys());

    const stores =
      await orderRepository.findAllStoresWithProducts(productBarcodes);

    if (stores.length === 0) {
      throw new BadRequestError(ORDERS_MESSAGES.SIMILAR_STORES_NOT_FOUND);
    }

    const recommendations: StoreRecommendation[] = [];

    for (const store of stores) {
      const availableProducts: ProductAvailability[] = [];
      const unavailableProducts: string[] = [];
      let totalPrice = 0;
      let totalOriginalPrice = 0;

      for (const [barcode, originalData] of productMap.entries()) {
        const storeProduct = store.products.find(
          (p: StoreProductData) => p.barcode === barcode
        );

        if (
          storeProduct &&
          storeProduct.stockQuantity >= originalData.quantity
        ) {
          const price = Number(storeProduct.discountingPrice);
          const originalPrice = Number(storeProduct.originalPrice);

          availableProducts.push({
            productName: originalData.productName,
            originalPrice,
            discountedPrice: price,
            available: true,
            stockQuantity: storeProduct.stockQuantity,
          });

          totalPrice += price * originalData.quantity;
          totalOriginalPrice += originalPrice * originalData.quantity;
        } else {
          unavailableProducts.push(originalData.productName);
        }
      }

      const availabilityRate =
        (availableProducts.length / productMap.size) * 100;

      if (availableProducts.length !== productMap.size) {
        continue;
      }

      let distance: number | null = null;

      if (
        userLatitude !== undefined &&
        userLongitude !== undefined &&
        store.coordinate
      ) {
        const storeCoords = parseCoordinates(store.coordinate);
        if (storeCoords) {
          distance = calculateDistance(
            userLatitude,
            userLongitude,
            storeCoords.lat,
            storeCoords.lng
          );
        }
      }

      let recommendation: 'best' | 'good' | 'alternative' = 'alternative';
      if (availabilityRate === 100) {
        recommendation = 'best';
      } else if (availabilityRate >= 75) {
        recommendation = 'good';
      }

      recommendations.push({
        storeId: store.id,
        storeName: store.storeName,
        address: store.address,
        distance,
        totalPrice,
        totalOriginalPrice,
        availableProducts,
        unavailableProducts,
        availabilityRate,
        recommendation,
      });
    }

    recommendations.sort((a, b) => {
      if (a.availabilityRate !== b.availabilityRate) {
        return b.availabilityRate - a.availabilityRate;
      }

      if (a.distance !== null && b.distance !== null) {
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }
      }

      if (a.totalPrice !== b.totalPrice) {
        return a.totalPrice - b.totalPrice;
      }

      return 0;
    });

    if (recommendations.length === 0) {
      throw new BadRequestError(ORDERS_MESSAGES.SIMILAR_STORES_NOT_FOUND);
    }

    recommendations.forEach((recommendation, index) => {
      if (index === 0 && recommendation.availabilityRate === 100) {
        recommendation.recommendation = 'best';
      } else if (recommendation.availabilityRate >= 75) {
        recommendation.recommendation = 'good';
      } else {
        recommendation.recommendation = 'alternative';
      }
    });

    return {
      orderId: order.id,
      originalStoreName: order.store.storeName,
      productCount: order.orderItems.length,
      storeRecommendations: recommendations,
    };
  },

  repurchaseToCart: async (
    userId: string,
    payload: RepurchaseToCartRequestDto
  ): Promise<RepurchaseToCartResponseDto> => {
    const { sourceOrderId, targetStoreId } = payload;

    const sourceOrder = await orderRepository.findOrderById(sourceOrderId);

    if (!sourceOrder) {
      throw new BadRequestError(ORDERS_MESSAGES.ROOT_ORDER_NOT_FOUND);
    }

    if (sourceOrder.consumerId !== userId) {
      throw new BadRequestError(ORDERS_MESSAGES.USER_NOT_PERMITTED);
    }

    const targetStore = await orderRepository.findStoreById(targetStoreId);
    if (!targetStore) {
      throw new BadRequestError(ORDERS_MESSAGES.STORE_NOT_FOUND);
    }

    await orderRepository.clearPendingCartsByConsumer(userId);

    const cart = await orderRepository.create({
      consumerId: userId,
      storeId: targetStoreId,
      orderType: 'DELIVERY',
      status: 'PENDING',
      totalAmount: 0,
    });

    const sourceItems = sourceOrder.orderItems;
    const sourceBarcodes = sourceItems.map(
      (item: { product: { barcode: string } }) => item.product.barcode
    );
    const targetProducts = await orderRepository.findProductsByBarcodesInStore(
      targetStoreId,
      sourceBarcodes
    );

    const targetProductMap = new Map<string, any>(
      targetProducts.map((product: { barcode: string }) => [
        product.barcode,
        product,
      ])
    );

    const skippedItems: string[] = [];
    let addedItemsCount = 0;

    for (const sourceItem of sourceItems) {
      const targetProduct = targetProductMap.get(sourceItem.product.barcode);

      if (!targetProduct) {
        skippedItems.push(sourceItem.product.name);
        continue;
      }

      if (targetProduct.stockQuantity < sourceItem.quantity) {
        skippedItems.push(sourceItem.product.name);
        continue;
      }

      const price = Number(
        targetProduct.discountingPrice ?? targetProduct.originalPrice
      );

      const existingCartItem = await orderRepository.findOrderItem(
        cart.id,
        targetProduct.id
      );

      if (existingCartItem) {
        await orderRepository.updateOrderItemQuantity(
          existingCartItem.id,
          existingCartItem.quantity + sourceItem.quantity
        );
      } else {
        await orderRepository.createOrderItemWithQuantity(
          cart.id,
          targetProduct.id,
          price,
          sourceItem.quantity
        );
      }

      await orderRepository.decreaseProductStock(
        targetProduct.id,
        sourceItem.quantity
      );

      addedItemsCount += 1;
    }

    const cartItems = await orderRepository.findOrderItems(cart.id);
    const total = calculateOrderTotal(cartItems);
    await orderRepository.updateOrderTotal(cart.id, total);

    return {
      orderId: cart.id,
      storeId: targetStoreId,
      addedItemsCount,
      skippedItems,
    };
  },

  updateOrderStatus: async (
    userId: string,
    orderId: string,
    status: string
  ) => {
    const staffRecord = await orderRepository.findStaffByUserId(userId);

    if (!staffRecord) {
      throw new BadRequestError('Không tìm thấy thông tin nhân viên cửa hàng');
    }

    const order = await orderRepository.findOrderById(orderId);

    if (!order) {
      throw new BadRequestError('Không tìm thấy đơn hàng');
    }

    if (order.storeId !== staffRecord.storeId) {
      throw new BadRequestError('Không có quyền cập nhật đơn hàng này');
    }

    const validStatuses = [
      'PENDING',
      'PREPARING',
      'PAID',
      'COMPLETED',
      'REJECTED',
    ] as const;

    if (!validStatuses.includes(status as (typeof validStatuses)[number])) {
      throw new BadRequestError('Trạng thái không hợp lệ');
    }

    await orderRepository.updateOrderStatus(
      orderId,
      status as 'PENDING' | 'PREPARING' | 'PAID' | 'COMPLETED' | 'REJECTED'
    );
  },

  getStaffOrders: async (userId: string) => {
    const staffRecord = await orderRepository.findStaffByUserId(userId);

    if (!staffRecord) {
      throw new BadRequestError('Không tìm thấy thông tin nhân viên cửa hàng');
    }

    const orders = await orderRepository.findOrdersByStore(staffRecord.storeId);

    return orders.map((order: any) => ({
      id: order.id,
      orderType: order.orderType,
      status: order.status,
      deliveryAddress: order.deliveryAddress,
      deliveryPhoneNumber: order.deliveryPhoneNumber,
      deliveryOption: order.deliveryOption,
      scheduledDeliveryAt: order.scheduledDeliveryAt,
      createdAt: order.createdAt,
      totalAmount: Number(order.totalAmount),
      consumer: {
        id: order.consumer.id,
        name: order.consumer.name,
        phoneNumber: order.consumer.phoneNumber,
      },
      items: order.orderItems.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        priceAtPurchase: Number(item.priceAtPurchase),
        imageUrls: item.product.imageUrls,
      })),
    }));
  },

  createOrder: async (userId: string, storeId: string) => {
    const existingOrder = await orderRepository.findPendingCartByStore(
      userId,
      storeId
    );
    console.log('Existing order:', existingOrder);

    if (existingOrder) {
      return existingOrder;
    }

    return orderRepository.create({
      consumerId: userId,
      storeId,
      orderType: 'DELIVERY',
      status: 'PENDING',
      totalAmount: 0,
    });
  },

  addOrderItem: async (
    userId: string,
    orderId: string,
    productId: string,
    quantity: number
  ) => {
    const order = await orderRepository.findPendingCartById(userId, orderId);
    if (!order) throw new BadRequestError(ORDERS_MESSAGES.CART_NOT_FOUND);

    const product = await orderRepository.findProductById(productId);
    if (!product) throw new BadRequestError(ORDERS_MESSAGES.PRODUCT_NOT_FOUND);
    if (product.stockQuantity < quantity)
      throw new BadRequestError(ORDERS_MESSAGES.EXCEED_STOCK);
    const existingItem = await orderRepository.findOrderItem(
      orderId,
      productId
    );
    let item;
    if (existingItem) {
      item = await orderRepository.updateOrderItemQuantity(
        existingItem.id,
        existingItem.quantity + quantity
      );
    } else {
      item = await orderRepository.createOrderItemWithQuantity(
        orderId,
        productId,
        Number(product.discountingPrice ?? product.originalPrice),
        quantity
      );
    }
    await orderRepository.decreaseProductStock(productId, quantity);
    const items = await orderRepository.findOrderItems(orderId);
    const total = calculateOrderTotal(items);
    await orderRepository.updateOrderTotal(orderId, total);
    return item;
  },

  getTodayRevenueByStaff: async (userId: string) => {
    const staff = await orderRepository.findStaffByUserId(userId);
    if (!staff) throw new Error('Staff not found');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const orders = await orderRepository.findOrdersByStore(staff.storeId);
    const todayOrders = orders.filter(
      (o: any) =>
        (o.status === 'PAID' && o.orderType === 'INSTORE') ||
        (o.status === 'COMPLETED' &&
          o.orderType === 'DELIVERY' &&
          new Date(o.createdAt) >= today &&
          new Date(o.createdAt) < tomorrow)
    );

    const yesterdayOrders = orders.filter(
      (o: any) =>
        (o.status === 'PAID' && o.orderType === 'INSTORE') ||
        (o.status === 'COMPLETED' &&
          o.orderType === 'DELIVERY' &&
          new Date(o.createdAt) >= yesterday &&
          new Date(o.createdAt) < today)
    );
    const todayTotal = todayOrders.reduce(
      (sum: number, o: any) => sum + Number(o.totalAmount),
      0
    );
    const yesterdayTotal = yesterdayOrders.reduce(
      (sum: number, o: any) => sum + Number(o.totalAmount),
      0
    );
    const compareToYesterday: number =
      ((todayTotal - yesterdayTotal) / (yesterdayTotal || 1)) * 100;
    return { total: todayTotal, compareToYesterday: compareToYesterday };
  },

  getCurrentCustomerCount: async (userId: string) => {
    const staff = await orderRepository.findStaffByUserId(userId);
    if (!staff) throw new Error('Staff not found');
    const orders = await orderRepository.findOrdersByStore(staff.storeId);
    const count = orders.filter(
      (o: any) =>
        o.orderType === 'INSTORE' && ['PENDING', 'PAID'].includes(o.status)
    ).length;
    return { count };
  },

  getActiveFraudAlertCount: async (userId: string) => {
    const staff = await orderRepository.findStaffByUserId(userId);
    if (!staff) throw new Error('Staff not found');
    const count = await fraudAlertRepository.countActiveByStore(staff.storeId);
    return { count };
  },

  getCompletedOrderCount: async (userId: string) => {
    const staff = await orderRepository.findStaffByUserId(userId);
    if (!staff) throw new Error('Staff not found');
    const orders = await orderRepository.findOrdersByStore(staff.storeId);
    const count = orders.filter((o: Order) => o.status === 'COMPLETED').length;
    return { count };
  },

  getRecentActivities: async (userId: string) => {
    const staff = await orderRepository.findStaffByUserId(userId);
    if (!staff) throw new Error('Staff not found');
    const orders = await orderRepository.findOrdersByStore(staff.storeId);
    const activities = orders
      .sort((a: any, b: any) => {
        const aTime =
          typeof a.createdAt === 'string'
            ? Date.parse(a.createdAt)
            : (a.createdAt?.getTime?.() ?? 0);
        const bTime =
          typeof b.createdAt === 'string'
            ? Date.parse(b.createdAt)
            : (b.createdAt?.getTime?.() ?? 0);
        return bTime - aTime;
      })
      .slice(0, 10)
      .map((o: any) => ({
        id: o.id,
        type:
          o.status === 'PAID'
            ? 'success'
            : o.status === 'PENDING'
              ? 'order'
              : 'other',
        name: o.consumer?.name || 'Khách',
        description: `Đơn hàng #${o.id} - ${o.status}`,
        time: o.createdAt,
      }));
    return { activities };
  },

  getPendingDeliveryOrderCount: async (userId: string) => {
    const staff = await orderRepository.findStaffByUserId(userId);
    if (!staff) throw new Error('Staff not found');
    const orders = await orderRepository.findOrdersByStore(staff.storeId);
    const count = orders.filter(
      (o: Order) => o.status === 'PAID' && o.orderType === 'DELIVERY'
    ).length;
    return { count };
  },
};

export default ordersService;
