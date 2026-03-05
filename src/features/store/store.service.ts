import { BadRequestError } from '@/core/apiError.js';
import storeRepository from '@/shared/repositories/store.repository.js';
import orderRepository from '@/shared/repositories/order.repository.js';
import { STORE_SCAN_MESSAGES } from './store.messages.js';
import type { ScanStoreResponse } from './dtos/scanStore.response.js';
import type { StoreDetailResponse } from './dtos/storeDetail.response.js';

const storeScanService = {
  scanStore: async (
    storeId: string,
    consumerId: string
  ): Promise<ScanStoreResponse> => {
    const activeCart = await orderRepository.findActiveCart(consumerId);

    if (activeCart) {
      if (activeCart.storeId === storeId) {
        return {
          orderId: activeCart.id,
          storeId: activeCart.storeId,
          orderType: activeCart.orderType,
          status: activeCart.status,
          totalAmount: Number(activeCart.totalAmount),
        };
      }
    }

    const store = await storeRepository.findById(storeId);

    if (!store) {
      throw new BadRequestError(STORE_SCAN_MESSAGES.STORE_NOT_FOUND);
    }

    const order = await orderRepository.create({
      consumerId,
      storeId,
      orderType: 'INSTORE',
      status: 'PENDING',
      totalAmount: 0,
    });

    return {
      orderId: order.id,
      storeId: order.storeId,
      orderType: order.orderType,
      status: order.status,
      totalAmount: Number(order.totalAmount),
    };
  },

  getStoreDetail: async (storeId: string): Promise<StoreDetailResponse> => {
    const store = await storeRepository.findById(storeId);

    if (!store) {
      throw new BadRequestError(STORE_SCAN_MESSAGES.STORE_NOT_FOUND);
    }

    return {
      id: store.id,
      storeName: store.storeName,
      address: store.address,
      contactPhone: store.contactPhone,
      avatarKey: store.avatarKey,
    };
  },
};

export default storeScanService;
