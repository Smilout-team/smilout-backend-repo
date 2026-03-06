import { Prisma } from '../../../generated/prisma/index.js';
import orderRepository from '@/shared/repositories/order.repository.js';
import { ORDERS_MESSAGES } from './orders.messages.js';
import type {
  ScanProductRequestDto,
  ScanProductResponseDto,
} from './dtos/index.js';
import { BadRequestError } from '@/core/apiError.js';

export const ordersService = {
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
      if (existingItem.quantity + 1 > product.stockQuantity) {
        throw new BadRequestError(ORDERS_MESSAGES.EXCEED_STOCK);
      }

      await orderRepository.updateOrderItemQuantity(
        existingItem.id,
        existingItem.quantity + 1
      );
    } else {
      const price = product.discountingPrice ?? product.originalPrice;

      await orderRepository.createOrderItem(cart.id, product.id, Number(price));
    }

    // Decrease stock quantity by 1
    await orderRepository.decreaseProductStock(product.id, 1);

    const items = await orderRepository.findOrderItems(cart.id);

    const total = items.reduce((sum: Prisma.Decimal, item) => {
      return sum.plus(item.priceAtPurchase.mul(item.quantity));
    }, new Prisma.Decimal(0));

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

    return items.map((item) => ({
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
    const total = items.reduce((sum: Prisma.Decimal, orderItem) => {
      return sum.plus(orderItem.priceAtPurchase.mul(orderItem.quantity));
    }, new Prisma.Decimal(0));

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
    const total = items.reduce((sum: Prisma.Decimal, orderItem) => {
      return sum.plus(orderItem.priceAtPurchase.mul(orderItem.quantity));
    }, new Prisma.Decimal(0));

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
};
