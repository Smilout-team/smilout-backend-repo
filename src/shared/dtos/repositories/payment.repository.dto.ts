export interface CreatePaymentDto {
  orderId: string;
  userLatitude?: number;
  userLongitude?: number;
  deliveryAddress?: string;
  deliveryOption?: 'ASAP' | 'SCHEDULED';
  scheduledDeliveryAt?: string;
}

export interface GetDeliveryAddressOptionsDto {
  userLatitude: number;
  userLongitude: number;
}

export interface SearchDeliveryAddressDto {
  keyword: string;
  userLatitude: number;
  userLongitude: number;
}

export interface DeliveryAddressOptionDto {
  id: string;
  label: string;
  address: string;
  fullAddress?: string;
  source: 'COORDINATE' | 'PROFILE' | 'GOONG';
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface ProcessPaymentResponseDto {
  orderId: string;
  storeId: string;
  status: 'PREPARING';
  deliveryAddress: string | null;
  deliveryOption: 'ASAP' | 'SCHEDULED' | null;
  scheduledDeliveryAt: Date | null;
  subtotalAmount: number;
  deliveryFee: number;
  distanceKm: number | null;
  totalAmount: number;
}
