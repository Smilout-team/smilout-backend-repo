import type { Request, Response } from 'express';
import { OrdersService } from './orders.service.js';
import { catchAsync } from '@/utils/catchAsync.js';

const ordersService = new OrdersService();

export const scanProduct = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not found in request' });
  }

  const result = await ordersService.scanProduct(userId, req.body);

  return res.json(result);
});
