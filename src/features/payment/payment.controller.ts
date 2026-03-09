import type { Request, Response } from 'express';
import { catchAsync } from '@/utils/catchAsync.js';
import paymentService from './payment.service.js';
import { ApiResponse } from '@/core/apiResponse.js';
import { PAYMENT_MESSAGES } from './payment.messages.js';

export const paymentController = {
  getDeliveryAddressOptions: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;

    const options = await paymentService.getDeliveryAddressOptions(userId, {
      userLatitude: Number(req.query.userLatitude),
      userLongitude: Number(req.query.userLongitude),
    });

    const response = ApiResponse.success(
      PAYMENT_MESSAGES.GET_DELIVERY_ADDRESS_LIST_SUCCESS,
      options
    );

    return res.status(response.statusCode).json(response);
  }),

  searchDeliveryAddresses: catchAsync(async (req: Request, res: Response) => {
    const options = await paymentService.searchDeliveryAddresses({
      keyword: String(req.query.keyword ?? ''),
      userLatitude: Number(req.query.userLatitude),
      userLongitude: Number(req.query.userLongitude),
    });

    const response = ApiResponse.success(
      PAYMENT_MESSAGES.GET_DELIVERY_ADDRESS_SUGGESTIONS_SUCCESS,
      options
    );

    return res.status(response.statusCode).json(response);
  }),

  processPayment: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;

    const orderData = await paymentService.processPayment(userId, req.body);

    const response = ApiResponse.success(PAYMENT_MESSAGES.SUCCESS, orderData);

    return res.status(response.statusCode).json(response);
  }),
};
