import { statusCodes } from './statusCode.constant.js';
import type { PaginateMetaInterface } from './paginationMeta.interface.js';
import type { PaginationOptions } from './paginationOptions.interface.js';

export class ApiResponse<T> {
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data?: T;
  public readonly meta?: PaginateMetaInterface;
  public readonly timestamp: Date;

  constructor(
    statusCode: number,
    message: string,
    data?: T,
    meta?: PaginateMetaInterface
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date();
    this.meta = meta;
  }

  static success<T>(message: string = 'Success', data: T): ApiResponse<T> {
    return new ApiResponse<T>(statusCodes.SUCCESS, message, data);
  }

  static created<T>(
    message: string = 'Created successfully',
    data: T
  ): ApiResponse<T> {
    return new ApiResponse<T>(statusCodes.CREATED, message, data);
  }

  static paginated<T>(
    message: string = 'Success',
    data: T,
    pagination: PaginationOptions
  ): ApiResponse<T> {
    const totalPages = Math.ceil(pagination.totalItems / pagination.limit);
    const meta: PaginateMetaInterface = {
      currentPage: pagination.currentPage,
      limit: pagination.limit,
      totalItems: pagination.totalItems,
      totalPages: totalPages,
    };
    return new ApiResponse<T>(statusCodes.SUCCESS, message, data, meta);
  }
}
