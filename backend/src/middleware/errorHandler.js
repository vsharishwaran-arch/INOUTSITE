import { ZodError } from 'zod';

export function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      issues: error.flatten(),
    });
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || 'Internal server error',
    details: error.details,
  });
}