import type { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { ApiError } from '@/core/apiError.js';
import { statusCodes } from '@/core/statusCode.constant.js';

interface ErrorResponse {
  statusCode: number;
  message: string;
  stack?: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode: number = statusCodes.INTERNAL_SERVER_ERROR;
  let message: string = 'Internal Server Error';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = statusCodes.BAD_REQUEST;
    message = 'Invalid JSON payload';
  }

  if (
    statusCode === statusCodes.INTERNAL_SERVER_ERROR ||
    process.env.NODE_ENV === 'development'
  ) {
    morgan.token('error-status', () => statusCode.toString());
    const errorLog = morgan(':method :url >> StatusCode: :error-status');
    errorLog(req, res, () => {});
    console.error(err);
  }

  const errorResponse: ErrorResponse = {
    statusCode,
    message,
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  return res.status(statusCode).json(errorResponse);
};
