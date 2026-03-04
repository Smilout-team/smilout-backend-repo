import { Router } from 'express';
import { paymentController } from './payment.controller.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
const paymentRoutes = Router();

// Endpoint: POST /api/v1/payment
paymentRoutes.post('/', authMiddleware, paymentController.processPayment);

export default paymentRoutes;
