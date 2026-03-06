import { Router } from 'express';
import { paymentController } from './payment.controller.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import { validate } from '@/middlewares/validate.middleware.js';
import { processPaymentSchema } from './schemas/index.js';

const paymentRoutes = Router();

paymentRoutes.post(
  '/',
  authMiddleware,
  validate(processPaymentSchema),
  paymentController.processPayment
);

export default paymentRoutes;
