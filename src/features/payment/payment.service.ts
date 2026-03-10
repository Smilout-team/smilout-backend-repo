import { BadRequestError } from '@/core/apiError.js';
import orderRepository from '@/shared/repositories/order.repository.js';
import userRepository from '@/shared/repositories/user.repository.js';
import {
  type CreatePaymentDto,
  type DeliveryAddressOptionDto,
  type GetDeliveryAddressOptionsDto,
  type ProcessPaymentResponseDto,
  type SearchDeliveryAddressDto,
} from '@/shared/dtos/repositories/payment.repository.dto.js';
import { PAYMENT_MESSAGES } from './payment.messages.js';
import {
  parseCoordinates,
  calculateDistance,
} from '@/shared/utils/coordinate.util.js';
import { calculateDeliveryFee } from './utils/delivery.util.js';
import {
  reverseGeocodeWithGoong,
  searchAddressWithGoong,
} from './utils/goong.util.js';

export const paymentService = {
  getDeliveryAddressOptions: async (
    userId: string,
    data: GetDeliveryAddressOptionsDto
  ): Promise<DeliveryAddressOptionDto[]> => {
    const user = await userRepository.findById(userId);
    const readableAddress = await reverseGeocodeWithGoong(
      data.userLatitude,
      data.userLongitude
    );

    const profileCoords = user?.coordinate
      ? parseCoordinates(user.coordinate)
      : null;

    const options: DeliveryAddressOptionDto[] = [
      {
        id: 'coordinate-default',
        label: 'Vị trí hiện tại',
        address:
          readableAddress ??
          `Gần tọa độ (${data.userLatitude.toFixed(5)}, ${data.userLongitude.toFixed(5)})`,
        fullAddress:
          readableAddress ??
          `Gần tọa độ (${data.userLatitude.toFixed(5)}, ${data.userLongitude.toFixed(5)})`,
        source: 'COORDINATE',
        latitude: data.userLatitude,
        longitude: data.userLongitude,
        isDefault: true,
      },
    ];

    if (user?.address) {
      options.push({
        id: 'profile-address',
        label: 'Địa chỉ hồ sơ',
        address: user.address,
        fullAddress: user.address,
        source: 'PROFILE',
        latitude: profileCoords?.lat ?? data.userLatitude,
        longitude: profileCoords?.lng ?? data.userLongitude,
        isDefault: false,
      });
    }

    return options;
  },

  searchDeliveryAddresses: async (
    data: SearchDeliveryAddressDto
  ): Promise<DeliveryAddressOptionDto[]> => {
    const goongResults = await searchAddressWithGoong(
      data.keyword,
      data.userLatitude,
      data.userLongitude
    );

    return goongResults.map((item, index) => ({
      id: `goong-${item.placeId}-${index}`,
      label: item.name,
      address: item.address,
      fullAddress: item.fullAddress,
      source: 'GOONG',
      latitude: item.latitude ?? data.userLatitude,
      longitude: item.longitude ?? data.userLongitude,
      isDefault: false,
    }));
  },

  processPayment: async (
    userId: string,
    data: CreatePaymentDto
  ): Promise<ProcessPaymentResponseDto> => {
    const activeCart = await orderRepository.findPendingCartById(
      userId,
      data.orderId
    );

    if (!activeCart) {
      throw new BadRequestError(PAYMENT_MESSAGES.INVALID_CART_SESSION);
    }

    const items = await orderRepository.findOrderItems(activeCart.id);

    if (items.length === 0) {
      throw new BadRequestError(PAYMENT_MESSAGES.CART_EMPTY);
    }

    const subtotalAmount = items.reduce(
      (sum, item) => sum + Number(item.priceAtPurchase) * item.quantity,
      0
    );

    if (subtotalAmount <= 0) {
      throw new BadRequestError(PAYMENT_MESSAGES.CART_EMPTY);
    }

    const isDeliveryOrder = activeCart.orderType === 'DELIVERY';

    if (isDeliveryOrder && !data.deliveryAddress?.trim()) {
      throw new BadRequestError(PAYMENT_MESSAGES.DELIVERY_ADDRESS_REQUIRED);
    }

    const deliveryOption = isDeliveryOrder
      ? (data.deliveryOption ?? 'ASAP')
      : undefined;

    const scheduledDeliveryAt =
      deliveryOption === 'SCHEDULED' && data.scheduledDeliveryAt
        ? new Date(data.scheduledDeliveryAt)
        : null;

    if (
      deliveryOption === 'SCHEDULED' &&
      (!scheduledDeliveryAt ||
        Number.isNaN(scheduledDeliveryAt.getTime()) ||
        scheduledDeliveryAt.getTime() <= Date.now())
    ) {
      throw new BadRequestError(
        PAYMENT_MESSAGES.SCHEDULED_DELIVERY_TIME_INVALID
      );
    }

    let deliveryFee = 0;
    let distanceKm: number | null = null;

    if (isDeliveryOrder) {
      if (
        data.userLatitude === undefined ||
        data.userLongitude === undefined ||
        !activeCart.store.coordinate
      ) {
        throw new BadRequestError(PAYMENT_MESSAGES.DELIVERY_LOCATION_REQUIRED);
      }

      const storeCoords = parseCoordinates(activeCart.store.coordinate);
      if (!storeCoords) {
        throw new BadRequestError(PAYMENT_MESSAGES.DELIVERY_LOCATION_REQUIRED);
      }

      distanceKm = calculateDistance(
        data.userLatitude,
        data.userLongitude,
        storeCoords.lat,
        storeCoords.lng
      );

      deliveryFee = calculateDeliveryFee(distanceKm);
    }

    const totalAmount = subtotalAmount + deliveryFee;

    const paidOrder = await orderRepository.completePaymentTransaction({
      consumerId: userId,
      orderId: activeCart.id,
      totalAmount,
      nextStatus: 'PAID',
      deliveryAddress: data.deliveryAddress,
      deliveryOption,
      scheduledDeliveryAt,
      insufficientBalanceMessage: PAYMENT_MESSAGES.INSUFFICIENT_BALANCE,
      invalidOrderMessage: PAYMENT_MESSAGES.INVALID_OR_PAID_ORDER,
    });

    return {
      orderId: paidOrder.id,
      storeId: paidOrder.storeId,
      status: paidOrder.status,
      deliveryAddress: paidOrder.deliveryAddress,
      deliveryOption: paidOrder.deliveryOption,
      scheduledDeliveryAt: paidOrder.scheduledDeliveryAt,
      subtotalAmount,
      deliveryFee,
      distanceKm,
      totalAmount: Number(paidOrder.totalAmount),
    };
  },
};

export default paymentService;
