import type { Request, Response } from 'express';
import { catchAsync } from '@/utils/catchAsync.js';
import storeScanService from './store.service.js';
import { ApiResponse } from '@/core/apiResponse.js';
import { STORE_SCAN_MESSAGES } from './store.messages.js';
import { BadRequestError } from '@/core/apiError.js';

export const storeScanController = {
  scanStore: catchAsync(async (req: Request, res: Response) => {
    const consumerId = req.user.id;
    const { storeId } = req.body;

    const data = await storeScanService.scanStore(storeId, consumerId);

    const response = ApiResponse.created(
      STORE_SCAN_MESSAGES.SCAN_SUCCESS,
      data
    );

    return res.status(response.statusCode).json(response);
  }),

  getStoreDetail: catchAsync(async (req: Request, res: Response) => {
    const { storeId } = req.params;

    if (!storeId || Array.isArray(storeId)) {
      throw new BadRequestError('Store ID không hợp lệ');
    }

    const data = await storeScanService.getStoreDetail(storeId);

    const response = ApiResponse.success(
      STORE_SCAN_MESSAGES.GET_STORE_DETAIL_SUCCESS,
      data
    );

    return res.status(response.statusCode).json(response);
  }),

  getNearbyStores: catchAsync(async (req: Request, res: Response) => {
    const {
      latitude,
      longitude,
      limit = 4,
    } = req.query as {
      latitude: string;
      longitude: string;
      limit?: string;
    };

    const data = await storeScanService.getNearbyStores(
      Number(latitude),
      Number(longitude),
      Number(limit)
    );

    const response = ApiResponse.success(
      STORE_SCAN_MESSAGES.GET_NEARBY_STORES_SUCCESS,
      data
    );

    return res.status(response.statusCode).json(response);
  }),
};
