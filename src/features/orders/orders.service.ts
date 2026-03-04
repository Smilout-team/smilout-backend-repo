import { Prisma } from 'generated/prisma/index.js';
import { OrderRepository } from '@/shared/repositories/order.repository.js';
import { ORDERS_MESSAGES } from './orders.messages.js';
import type {
  ScanProductRequestDto,
  ScanProductResponseDto,
} from './dtos/index.js';
import { BadRequestError } from '@/core/apiError.js';

export class OrdersService {
  async scanProduct(
    userId: string,
    payload: ScanProductRequestDto
  ): Promise<ScanProductResponseDto> {
    const { barcode } = payload;

    const cart = await OrderRepository.findActiveCart(userId);
    if (!cart) {
      throw new BadRequestError(ORDERS_MESSAGES.NO_ACTIVE_CART);
    }

    const product = await OrderRepository.findProductByBarcode(
      barcode,
      cart.storeId
    );

    if (!product) {
      throw new BadRequestError(ORDERS_MESSAGES.PRODUCT_NOT_FOUND);
    }

    if (product.stockQuantity < 1) {
      throw new BadRequestError(ORDERS_MESSAGES.OUT_OF_STOCK);
    }

    const existingItem = await OrderRepository.findOrderItem(
      cart.id,
      product.id
    );

    if (existingItem) {
      if (existingItem.quantity + 1 > product.stockQuantity) {
        throw new BadRequestError(ORDERS_MESSAGES.EXCEED_STOCK);
      }

      await OrderRepository.updateOrderItemQuantity(
        existingItem.id,
        existingItem.quantity + 1
      );
    } else {
      const price = product.discountingPrice ?? product.originalPrice;

      await OrderRepository.createOrderItem(cart.id, product.id, Number(price));
    }

    const items = await OrderRepository.findOrderItems(cart.id);

    const total = items.reduce((sum: Prisma.Decimal, item) => {
      return sum.plus(item.priceAtPurchase.mul(item.quantity));
    }, new Prisma.Decimal(0));

    await OrderRepository.updateOrderTotal(cart.id, total);

    const updatedItem = await OrderRepository.findOrderItem(
      cart.id,
      product.id
    );

    return {
      message: ORDERS_MESSAGES.SCAN_SUCCESS,
      productId: product.id,
      quantity: updatedItem!.quantity,
    };
  }
}
