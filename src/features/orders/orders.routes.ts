import { Router } from 'express';
import {
  getMyOrders,
  scanProduct,
  getOrderItems,
  deleteOrderItem,
  updateOrderItemQuantity,
  repurchaseOrder,
  repurchaseToCart,
} from './orders.controller.js';
import { validate } from '@/middlewares/validate.middleware.js';
import {
  scanProductSchema,
  getOrderItemsSchema,
  repurchaseOrderSchema,
  repurchaseToCartSchema,
} from './schemas/index.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/me', getMyOrders);

router.post('/scan-product', validate(scanProductSchema), scanProduct);

router.post('/repurchase', validate(repurchaseOrderSchema), repurchaseOrder);

router.post(
  '/repurchase-to-cart',
  validate(repurchaseToCartSchema),
  repurchaseToCart
);

router.get('/:orderId/items', validate(getOrderItemsSchema), getOrderItems);

router.delete('/:orderId/items/:itemId', deleteOrderItem);

router.patch('/:orderId/items/:itemId', updateOrderItemQuantity);

export default router;
