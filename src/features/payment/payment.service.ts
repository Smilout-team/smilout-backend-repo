import { BadRequestError } from '@/core/apiError.js';
import orderRepository from '@/shared/repositories/order.repository.js';
import {
  type CreatePaymentDto,
  type ProcessPaymentResponseDto,
} from '@/shared/dtos/repositories/payment.repository.dto.js';
import { PAYMENT_MESSAGES } from './payment.messages.js';

export const paymentService = {
  processPayment: async (
    userId: string,
    data: CreatePaymentDto
  ): Promise<ProcessPaymentResponseDto> => {
    const activeCart = await orderRepository.findActiveCart(userId);

    if (!activeCart) {
      throw new BadRequestError(PAYMENT_MESSAGES.NO_ACTIVE_CART);
    }

    if (activeCart.id !== data.orderId) {
      throw new BadRequestError(PAYMENT_MESSAGES.INVALID_CART_SESSION);
    }

    const items = await orderRepository.findOrderItems(activeCart.id);

    if (items.length === 0) {
      throw new BadRequestError(PAYMENT_MESSAGES.CART_EMPTY);
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.priceAtPurchase) * item.quantity,
      0
    );

    if (totalAmount <= 0) {
      throw new BadRequestError(PAYMENT_MESSAGES.CART_EMPTY);
    }

    const paidOrder = await orderRepository.completePaymentTransaction({
      consumerId: userId,
      orderId: activeCart.id,
      totalAmount,
      insufficientBalanceMessage: PAYMENT_MESSAGES.INSUFFICIENT_BALANCE,
      invalidOrderMessage: PAYMENT_MESSAGES.INVALID_OR_PAID_ORDER,
    });

    return {
      orderId: paidOrder.id,
      storeId: paidOrder.storeId,
      status: paidOrder.status,
      totalAmount: Number(paidOrder.totalAmount),
    };
  },
};

export default paymentService;
