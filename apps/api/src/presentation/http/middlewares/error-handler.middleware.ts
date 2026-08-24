import { Request, Response, NextFunction } from 'express';
import { AppError } from '@personal-os/shared';
import { ApiErrorResponse } from '@personal-os/types';

export function errorHandlerMiddleware(
  err: Error,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      error: err.code,
      message: err.message,
      timestamp: new Date().toISOString(),
      details: err.details
    });
    return;
  }

  // Unhandled error fallback
  console.error('[UnhandledError]', err);
  res.status(500).json({
    success: false,
    statusCode: 500,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected internal error occurred',
    timestamp: new Date().toISOString()
  });
}
