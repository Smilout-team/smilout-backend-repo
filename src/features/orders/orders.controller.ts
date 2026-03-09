import type { Request, Response } from 'express';
import { ordersService } from './orders.service.js';
import { catchAsync } from '@/utils/catchAsync.js';
import { ApiResponse } from '@/core/apiResponse.js';

export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const orders = await ordersService.getMyOrders(userId);

  const response = ApiResponse.success(
    'Lấy lịch sử đơn hàng thành công',
    orders
  );

  return res.status(response.statusCode).json(response);
});

export const scanProduct = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await ordersService.scanProduct(userId, req.body);

  return res.json(result);
});

export const getOrderItems = catchAsync(async (req: Request, res: Response) => {
  const orderId = Array.isArray(req.params.orderId)
    ? req.params.orderId[0]
    : req.params.orderId;

  const items = await ordersService.getOrderItems(orderId);

  const response = ApiResponse.success(
    'Lấy danh sách sản phẩm thành công',
    items
  );

  return res.status(response.statusCode).json(response);
});

export const deleteOrderItem = catchAsync(
  async (req: Request, res: Response) => {
    const orderId = Array.isArray(req.params.orderId)
      ? req.params.orderId[0]
      : req.params.orderId;
    const itemId = Array.isArray(req.params.itemId)
      ? req.params.itemId[0]
      : req.params.itemId;

    const result = await ordersService.deleteOrderItem(orderId, itemId);

    const response = ApiResponse.success(result.message, null);

    return res.status(response.statusCode).json(response);
  }
);

export const updateOrderItemQuantity = catchAsync(
  async (req: Request, res: Response) => {
    const orderId = Array.isArray(req.params.orderId)
      ? req.params.orderId[0]
      : req.params.orderId;
    const itemId = Array.isArray(req.params.itemId)
      ? req.params.itemId[0]
      : req.params.itemId;
    const { quantity } = req.body;

    const result = await ordersService.updateOrderItemQuantity(
      orderId,
      itemId,
      quantity
    );

    const response = ApiResponse.success(result.message, result.updatedItem);

    return res.status(response.statusCode).json(response);
  }
);

export const repurchaseOrder = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const result = await ordersService.repurchaseOrder(userId, req.body);

    const response = ApiResponse.success(
      'Tìm cửa hàng đề xuất thành công',
      result
    );

    return res.status(response.statusCode).json(response);
  }
);

export const repurchaseToCart = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const result = await ordersService.repurchaseToCart(userId, req.body);

    const response = ApiResponse.success(
      'Tạo giỏ hàng mua lại thành công',
      result
    );

    return res.status(response.statusCode).json(response);
  }
);
