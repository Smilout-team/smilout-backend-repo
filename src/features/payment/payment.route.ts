import { Router } from 'express';
import { paymentController } from './payment.controller.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import { validate } from '@/middlewares/validate.middleware.js';
import {
  deliveryAddressOptionsSchema,
  processPaymentSchema,
  searchDeliveryAddressSchema,
} from './schemas/index.js';

const paymentRoutes = Router();

paymentRoutes.get(
  '/delivery-addresses',
  authMiddleware,
  validate(deliveryAddressOptionsSchema),
  paymentController.getDeliveryAddressOptions
);

paymentRoutes.get(
  '/delivery-addresses/search',
  authMiddleware,
  validate(searchDeliveryAddressSchema),
  paymentController.searchDeliveryAddresses
);

paymentRoutes.post(
  '/',
  authMiddleware,
  validate(processPaymentSchema),
  paymentController.processPayment
);

export default paymentRoutes;
