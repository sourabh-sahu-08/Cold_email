import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  console.error(`[Error] ${req.method} ${req.url} - ${err.message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
