import type { Request, Response } from 'express';
import { OrdersService } from './orders.service.js';

const ordersService = new OrdersService();

export const scanProduct = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not found in request' });
    }

    const result = await ordersService.scanProduct(userId, req.body);

    return res.json(result);
  } catch (err) {
    console.error('SCAN ERROR:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
