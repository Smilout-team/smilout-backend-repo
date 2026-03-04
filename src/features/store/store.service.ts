import { randomUUID } from 'crypto';
import { BadRequestError } from '@/core/apiError.js';
import storeRepository from '@/shared/repositories/store.repository.js';
import orderRepository from '@/shared/repositories/order.repository.js';
import { STORE_SCAN_MESSAGES } from './store.messages.js';
import type { ScanStoreResponse } from './dtos/scanStore.response.js';

const storeScanService = {
  scanStore: async (
    storeId: string,
    consumerId: string
  ): Promise<ScanStoreResponse> => {
    const activeOrder =
      await orderRepository.findActiveOrderByConsumer(consumerId);

    if (activeOrder) {
      throw new BadRequestError(STORE_SCAN_MESSAGES.ACTIVE_ORDER_EXISTS);
    }

    const store = await storeRepository.findById(storeId);

    if (!store) {
      throw new BadRequestError(STORE_SCAN_MESSAGES.STORE_NOT_FOUND);
    }

    const order = await orderRepository.create({
      id: randomUUID(),
      consumer_id: consumerId,
      store_id: storeId,
      order_type: 'INSTORE',
      status: 'PENDING',
      total_amount: 0,
    });

    return {
      orderId: order.id,
      storeId: order.storeId,
      orderType: order.orderType,
      status: order.status,
      totalAmount: Number(order.totalAmount),
    };
  },
};

export default storeScanService;
