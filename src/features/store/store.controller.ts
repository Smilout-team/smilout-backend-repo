import type { Request, Response } from 'express';
import { catchAsync } from '@/utils/catchAsync.js';
import storeScanService from './store.service.js';
import { ApiResponse } from '@/core/apiResponse.js';
import { statusCodes } from '@/core/statusCode.constant.js';
import { STORE_SCAN_MESSAGES } from './store.messages.js';

export const storeScanController = {
  scanStore: catchAsync(async (req: Request, res: Response) => {
    const consumerId = req.user.id;
    const { storeId } = req.body;

    const data = await storeScanService.scanStore(storeId, consumerId);

    const response = new ApiResponse(
      statusCodes.CREATED,
      STORE_SCAN_MESSAGES.SCAN_SUCCESS,
      data
    );

    return res.status(response.statusCode).json(response);
  }),
};
