import { Prisma } from '../../../../generated/prisma/index.js';

export function calculateOrderTotal(
  items: Array<{ priceAtPurchase: Prisma.Decimal; quantity: number }>
): Prisma.Decimal {
  return items.reduce((sum: Prisma.Decimal, item) => {
    return sum.plus(item.priceAtPurchase.mul(item.quantity));
  }, new Prisma.Decimal(0));
}
