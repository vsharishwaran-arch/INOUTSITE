import { ZodError } from 'zod';
import env from '../config/env.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  // Structured logging
  logger.error(error.message, {
    method: req.method,
    url: req.originalUrl,
    statusCode: error.statusCode || 500,
    stack: env.nodeEnv !== 'production' ? error.stack : undefined,
  }, error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      issues: error.flatten(),
    });
  }

  const statusCode = error.statusCode || 500;
  
  if (env.nodeEnv === 'production' && statusCode === 500) {
    return res.status(500).json({
      message: 'Internal server error',
    });
  }

  res.status(statusCode).json({
    message: error.message || 'Internal server error',
    details: env.nodeEnv === 'production' ? undefined : error.details,
    stack: env.nodeEnv === 'production' ? undefined : error.stack,
  });
}