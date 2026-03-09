export function calculateDeliveryFee(distanceKm: number): number {
  if (distanceKm < 3) {
    return 0;
  }

  if (distanceKm <= 5) {
    return 15000;
  }

  return 15000 + Math.ceil(distanceKm - 5) * 3000;
}
