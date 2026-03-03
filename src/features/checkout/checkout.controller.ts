import type { Request, Response } from 'express';
import { catchAsync } from '@/utils/catchAsync.js';
import checkoutService from './checkout.service.js';
import { ApiResponse } from '@/core/apiResponse.js';
import { statusCodes } from '@/core/statusCode.constant.js';

export const checkoutController = {
  processCheckout: catchAsync(async (req: Request, res: Response) => {
    // req.user.id lấy từ authMiddleware của team em
    const userId = req.user.id;

    // Gọi qua service để xử lý
    const orderData = await checkoutService.processCheckout(userId, req.body);

    // Trả data về FE theo chuẩn ApiResponse của Leader
    const response = new ApiResponse(
      statusCodes.SUCCESS,
      'Thanh toán đơn hàng thành công!',
      orderData
    );

    return res.status(response.statusCode).json(response);
  }),
};
