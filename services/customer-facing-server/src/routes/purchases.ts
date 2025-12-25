/**
 * Purchases Route
 * 
 * Handles getAllUserBuys request and proxies to Customer Management API
 * Assignment UUID: e271b052-9200-4502-b491-62f1649c07
 */

import { Router, Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import { logger } from '../utils/logger';
import { query, validationResult } from 'express-validator';

const ASSIGNMENT_UUID = 'e271b052-9200-4502-b491-62f1649c07';
const router = Router();

// Customer Management API URL from environment variable
const CUSTOMER_MANAGEMENT_API_URL = process.env.CUSTOMER_MANAGEMENT_API_URL || 'http://customer-management-api-service:3001';

/**
 * GET /api/purchases
 * 
 * Retrieves all customer purchases by proxying request to Customer Management API
 * 
 * Query parameters (passed to Customer Management API):
 * - userid: Filter by user ID
 * - username: Filter by username
 * - limit: Limit number of results
 * - offset: Skip number of results
 * - sort: Sort order ('asc' or 'desc')
 */
router.get(
  '/',
  [
    query('userid').optional().isString().trim(),
    query('username').optional().isString().trim(),
    query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('sort').optional().isIn(['asc', 'desc'])
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: errors.array(),
          assignmentUuid: ASSIGNMENT_UUID
        });
      }

      // Build query string from request query parameters
      const queryParams = new URLSearchParams();
      if (req.query.userid) queryParams.append('userid', req.query.userid as string);
      if (req.query.username) queryParams.append('username', req.query.username as string);
      if (req.query.limit) queryParams.append('limit', req.query.limit as string);
      if (req.query.offset) queryParams.append('offset', req.query.offset as string);
      if (req.query.sort) queryParams.append('sort', req.query.sort as string);

      const queryString = queryParams.toString();
      const url = `${CUSTOMER_MANAGEMENT_API_URL}/api/purchases${queryString ? `?${queryString}` : ''}`;

      logger.info('Proxying request to Customer Management API', {
        url,
        assignmentUuid: ASSIGNMENT_UUID
      });

      // Make request to Customer Management API
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Return the response from Customer Management API
      res.json(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        logger.error('Error proxying request to Customer Management API', {
          error: axiosError.message,
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          url: axiosError.config?.url,
          assignmentUuid: ASSIGNMENT_UUID
        });

        // Forward the error response from Customer Management API
        if (axiosError.response) {
          return res.status(axiosError.response.status).json({
            error: 'Error from Customer Management API',
            message: axiosError.response.data || axiosError.message,
            assignmentUuid: ASSIGNMENT_UUID
          });
        }

        // Network or timeout error
        return res.status(503).json({
          error: 'Service unavailable',
          message: 'Customer Management API is not reachable',
          details: axiosError.message,
          assignmentUuid: ASSIGNMENT_UUID
        });
      }

      // Unknown error
      logger.error('Unknown error in purchases route', {
        error: error instanceof Error ? error.message : String(error),
        assignmentUuid: ASSIGNMENT_UUID
      });

      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        assignmentUuid: ASSIGNMENT_UUID
      });
    }
  }
);

export { router as purchasesRouter };

