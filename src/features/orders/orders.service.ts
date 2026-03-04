import { Prisma } from 'generated/prisma/index.js';
import { OrderRepository } from '@/shared/repositories/order.repository.js';
import { ORDERS_MESSAGES } from './orders.messages.js';
import type {
  ScanProductRequestDto,
  ScanProductResponseDto,
} from './dtos/index.js';
import { BadRequestError } from '@/core/apiError.js';

export class OrdersService {
  private orderRepository = new OrderRepository();

  async scanProduct(
    userId: string,
    payload: ScanProductRequestDto
  ): Promise<ScanProductResponseDto> {
    const { barcode } = payload;

    const product = await this.orderRepository.findProductByBarcode(barcode);
    if (!product) {
      throw new BadRequestError(ORDERS_MESSAGES.PRODUCT_NOT_FOUND);
    }

    if (product.stockQuantity < 1) {
      throw new BadRequestError(ORDERS_MESSAGES.OUT_OF_STOCK);
    }

    let cart = await this.orderRepository.findActiveCart(userId);
    if (!cart) {
      cart = await this.orderRepository.createCart(userId, product.storeId);
    }

    const existingItem = await this.orderRepository.findOrderItem(
      cart.id,
      product.id
    );
    if (existingItem) {
      if (existingItem.quantity + 1 > product.stockQuantity) {
        throw new BadRequestError(ORDERS_MESSAGES.EXCEED_STOCK);
      }

      await this.orderRepository.updateOrderItemQuantity(
        existingItem.id,
        existingItem.quantity + 1
      );
    } else {
      const price = product.discountingPrice ?? product.originalPrice;

      await this.orderRepository.createOrderItem(
        cart.id,
        product.id,
        Number(price)
      );
    }

    const items = await this.orderRepository.findOrderItems(cart.id);

    const total = items.reduce((sum: Prisma.Decimal, item) => {
      return sum.plus(item.priceAtPurchase.mul(item.quantity));
    }, new Prisma.Decimal(0));

    await this.orderRepository.updateOrderTotal(cart.id, total);

    const updatedItem = await this.orderRepository.findOrderItem(
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
