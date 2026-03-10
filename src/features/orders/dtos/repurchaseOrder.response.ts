export interface ProductAvailability {
  productName: string;
  originalPrice: number;
  discountedPrice: number;
  available: boolean;
  stockQuantity: number;
}

export interface StoreRecommendation {
  storeId: string;
  storeName: string;
  address: string;
  distance: number | null;
  totalPrice: number;
  totalOriginalPrice: number;
  availableProducts: ProductAvailability[];
  unavailableProducts: string[];
  availabilityRate: number;
  recommendation: 'best' | 'good' | 'alternative';
}

export interface RepurchaseOrderResponseDto {
  orderId: string;
  originalStoreName: string;
  productCount: number;
  storeRecommendations: StoreRecommendation[];
}
