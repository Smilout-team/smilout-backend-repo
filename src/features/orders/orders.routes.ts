import { Router } from 'express';
import {
  getMyOrders,
  getStaffOrders,
  updateOrderStatus,
  scanProduct,
  getOrderItems,
  deleteOrderItem,
  updateOrderItemQuantity,
  repurchaseOrder,
  repurchaseToCart,
  createOrder,
  addOrderItem,
  getTodayRevenueByStaff,
  getCurrentCustomerCount,
  getActiveFraudAlertCount,
  getCompletedOrderCount,
  getRecentActivities,
  getPendingDeliveryOrderCount,
  getMyLatestOrder,
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
router.get('/staff/orders', getStaffOrders);

router.get('/me', getMyOrders);
router.patch('/:orderId/status', updateOrderStatus);

router.post('/scan-product', validate(scanProductSchema), scanProduct);

router.post('/repurchase', validate(repurchaseOrderSchema), repurchaseOrder);

router.post(
  '/repurchase-to-cart',
  validate(repurchaseToCartSchema),
  repurchaseToCart
);

router.get('/:orderId/items', validate(getOrderItemsSchema), getOrderItems);

router.delete('/:orderId/items/:itemId', deleteOrderItem);

router.post('/:orderId/items', addOrderItem);

router.patch('/:orderId/items/:itemId', updateOrderItemQuantity);

router.post('/', createOrder);

router.get('/staff/revenue/today', getTodayRevenueByStaff);
router.get('/staff/customers/current', getCurrentCustomerCount);
router.get('/staff/fraud-alerts/count', getActiveFraudAlertCount);
router.get('/staff/orders/count/completed', getCompletedOrderCount);
router.get('/staff/activities/recent', getRecentActivities);
router.get(
  '/staff/orders/count/pending-delivery',
  getPendingDeliveryOrderCount
);

router.get('/me/latest', getMyLatestOrder);

export default router;
