/**
 * Error Handler Middleware
 * 
 * Centralized error handling for the API
 * Assignment UUID: e271b052-9200-4502-b491-62f1649c07
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const ASSIGNMENT_UUID = 'e271b052-9200-4502-b491-62f1649c07';

/**
 * Error handler middleware
 * Catches all errors and returns appropriate HTTP responses
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    assignmentUuid: ASSIGNMENT_UUID
  });

  // Default error response
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : error.message;

  res.status(statusCode).json({
    error: message,
    assignmentUuid: ASSIGNMENT_UUID,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
}

