import { BadRequestError } from '@/core/apiError.js';
import productRepository from '@/shared/repositories/product.repository.js';
import walletRepository from '@/shared/repositories/wallet.repository.js';
import orderRepository from '@/shared/repositories/order.repository.js';

export const checkoutService = {
  processCheckout: async (userId: string, data: any) => {
    const { storeId, items } = data; // Bỏ paymentMethod vì DB không có

    let totalAmount = 0;
    const processedItems = [];

    // 1. Tính tổng tiền và check tồn kho
    for (const item of items) {
      const product = await productRepository.findById(item.productId);

      if (!product) {
        throw new BadRequestError(
          `Sản phẩm có ID ${item.productId} không tồn tại.`
        );
      }
      if (product.stockQuantity < item.quantity) {
        throw new BadRequestError(
          `Sản phẩm ${product.name} không đủ số lượng.`
        );
      }

      // Lấy giá bán (discountingPrice) từ DB. Chuyển sang Number để tính toán
      const itemPrice = Number(product.discountingPrice);
      totalAmount += itemPrice * item.quantity;

      // Lưu lại giá lúc mua để ghi vào OrderItem
      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: itemPrice,
      });
    }

    // 2. Kiểm tra số dư ví
    const userWallet = await walletRepository.findByUserId(userId);
    if (!userWallet || Number(userWallet.balance) < totalAmount) {
      throw new BadRequestError('Số dư ví không đủ để thanh toán!');
    }

    // 3. Thực hiện Giao dịch
    const newOrder = await orderRepository.createCheckoutTransaction({
      userId,
      storeId,
      totalAmount,
      items: processedItems,
    });

    return newOrder;
  },
};

export default checkoutService;
