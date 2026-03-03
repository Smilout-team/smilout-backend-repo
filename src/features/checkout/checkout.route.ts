import { Router } from 'express';
import { checkoutController } from './checkout.controller.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
// Tạm thời chưa gắn validate schema, nếu rảnh mình viết Schema sau

const checkoutRoutes = Router();

// Endpoint: POST /api/v1/checkout
checkoutRoutes.post(
  '/',
  authMiddleware, // Bắt buộc user phải đăng nhập (có token) mới được thanh toán
  checkoutController.processCheckout
);

export default checkoutRoutes;
