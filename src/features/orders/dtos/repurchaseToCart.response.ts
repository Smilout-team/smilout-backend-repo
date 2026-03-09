export interface RepurchaseToCartResponseDto {
  orderId: string;
  storeId: string;
  addedItemsCount: number;
  skippedItems: string[];
}
