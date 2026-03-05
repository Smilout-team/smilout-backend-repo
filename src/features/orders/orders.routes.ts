import { Router } from 'express';
import {
  scanProduct,
  getOrderItems,
  deleteOrderItem,
  updateOrderItemQuantity,
} from './orders.controller.js';
import { validate } from '@/middlewares/validate.middleware.js';
import { scanProductSchema, getOrderItemsSchema } from './schemas/index.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/scan-product', validate(scanProductSchema), scanProduct);

router.get('/:orderId/items', validate(getOrderItemsSchema), getOrderItems);

router.delete('/:orderId/items/:itemId', deleteOrderItem);

router.patch('/:orderId/items/:itemId', updateOrderItemQuantity);

export default router;
