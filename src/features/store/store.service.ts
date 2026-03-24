import { BadRequestError } from '@/core/apiError.js';
import storeRepository from '@/shared/repositories/store.repository.js';
import orderRepository from '@/shared/repositories/order.repository.js';
import { STORE_SCAN_MESSAGES } from './store.messages.js';
import type { ScanStoreResponse } from './dtos/scanStore.response.js';
import type { StoreDetailResponse } from './dtos/storeDetail.response.js';
import type { NearbyStoreResponse } from './dtos/nearbyStore.response.js';
import {
  calculateDistance,
  parseCoordinates,
} from '@/shared/utils/coordinate.util.js';

const storeScanService = {
  scanStore: async (
    storeId: string,
    consumerId: string
  ): Promise<ScanStoreResponse> => {
    await orderRepository.clearPendingCartsByConsumer(consumerId);
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

    await orderRepository.clearPendingCartsByConsumer(consumerId);

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
      coordinate: store.coordinate,
    };
  },

  getNearbyStores: async (
    latitude: number,
    longitude: number,
    limit: number
  ): Promise<NearbyStoreResponse[]> => {
    const stores = await storeRepository.findActiveStoresWithCoordinates();

    const mapped = stores
      .map((store: StoreDetailResponse) => {
        if (!store.coordinate) {
          return null;
        }

        const parsed = parseCoordinates(store.coordinate);
        if (!parsed) {
          return null;
        }

        return {
          storeId: store.id,
          storeName: store.storeName,
          address: store.address,
          latitude: parsed.lat,
          longitude: parsed.lng,
          distance: calculateDistance(
            latitude,
            longitude,
            parsed.lat,
            parsed.lng
          ),
        };
      })
      .filter(
        (item: NearbyStoreResponse | null): item is NearbyStoreResponse =>
          !!item
      )
      .sort(
        (a: NearbyStoreResponse, b: NearbyStoreResponse) =>
          a.distance - b.distance
      )
      .slice(0, limit);

    return mapped;
  },

  getConsumersInStore: async (storeId: string) => {
    const consumers = await orderRepository.findConsumersInStore(storeId);
    return consumers;
  },
};

export default storeScanService;
