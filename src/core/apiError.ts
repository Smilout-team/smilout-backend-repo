import { statusCodes } from './statusCode.constant.js';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad Request') {
    super(statusCodes.BAD_REQUEST, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource Not Found') {
    super(statusCodes.NOT_FOUND, message);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(statusCodes.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(statusCodes.FORBIDDEN, message);
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal Server Error') {
    super(statusCodes.INTERNAL_SERVER_ERROR, message);
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(message: string = 'Too Many Requests') {
    super(statusCodes.TOO_MANY_REQUESTS, message);
  }
}
