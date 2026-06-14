import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Operational errors (known, safe to expose)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: messages,
    });
  }

  // Prisma errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as { code?: string };
    if (prismaErr.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Resource already exists' });
    }
    if (prismaErr.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }
  }

  // Unknown errors - log and hide details in production
  logger.error(`Unhandled error: ${err.message}`, {
    url: req.url,
    method: req.method,
    stack: err.stack,
  });

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
