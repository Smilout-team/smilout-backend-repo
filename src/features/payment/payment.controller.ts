import type { Request, Response } from 'express';
import { catchAsync } from '@/utils/catchAsync.js';
import paymentService from './payment.service.js';
import { ApiResponse } from '@/core/apiResponse.js';
import { statusCodes } from '@/core/statusCode.constant.js';
import { PAYMENT_MESSAGES } from './payment.messages.js';

export const paymentController = {
  processPayment: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;

    const orderData = await paymentService.processPayment(userId, req.body);

    const response = new ApiResponse(
      statusCodes.SUCCESS,
      PAYMENT_MESSAGES.SUCCESS,
      orderData
    );

    return res.status(response.statusCode).json(response);
  }),
};
