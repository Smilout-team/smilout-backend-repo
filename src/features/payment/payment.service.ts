import { BadRequestError } from '@/core/apiError.js';
import productRepository from '@/shared/repositories/product.repository.js';
import walletRepository from '@/shared/repositories/wallet.repository.js';
import orderRepository from '@/shared/repositories/order.repository.js';
import { type CreatePaymentDto } from '@/shared/dtos/repositories/payment.repository.dto.js';

export const paymentService = {
  processPayment: async (userId: string, data: CreatePaymentDto) => {
    const { storeId, items } = data;

    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await productRepository.findById(item.productId);

      if (!product) {
        throw new BadRequestError(
          `Sản phẩm có ID ${item.productId} không tồn tại.`
        );
      }

      if (product.stockQuantity < item.quantity) {
        throw new BadRequestError(
          `Sản phẩm ${product.name} hiện không đủ số lượng trong kho.`
        );
      }

      const itemPrice = Number(product.discountingPrice);
      totalAmount += itemPrice * item.quantity;

      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: itemPrice,
      });
    }

    const userWallet = await walletRepository.findByUserId(userId);
    if (!userWallet || Number(userWallet.balance) < totalAmount) {
      throw new BadRequestError('Số dư ví không đủ để thực hiện thanh toán!');
    }

    const newOrder = await orderRepository.createPaymentTransaction({
      userId,
      storeId,
      totalAmount,
      items: processedItems,
    });

    return newOrder;
  },
};

export default paymentService;
