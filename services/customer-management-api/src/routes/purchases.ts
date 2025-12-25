/**
 * Purchases Routes
 * 
 * GET route to return all customer purchases
 * Assignment UUID: e271b052-9200-4502-b491-62f1649c07
 */

import { Router, Request, Response } from 'express';
import { Purchase } from '../models/Purchase';
import { logger } from '../utils/logger';
import { query, validationResult } from 'express-validator';

const ASSIGNMENT_UUID = 'e271b052-9200-4502-b491-62f1649c07';
const router = Router();

/**
 * GET /api/purchases
 * 
 * Returns all customer purchases
 * Optional query parameters:
 * - userid: Filter by user ID
 * - username: Filter by username
 * - limit: Limit number of results (default: 100)
 * - offset: Skip number of results (default: 0)
 * - sort: Sort order ('asc' or 'desc', default: 'desc')
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

      const { userid, username, limit = 100, offset = 0, sort = 'desc' } = req.query;

      // Build query filter
      const filter: any = {};
      if (userid) {
        filter.userid = userid as string;
      }
      if (username) {
        filter.username = username as string;
      }

      // Build sort order
      const sortOrder = sort === 'asc' ? 1 : -1;

      // Query MongoDB
      const purchases = await Purchase.find(filter)
        .sort({ timestamp: sortOrder })
        .limit(Number(limit))
        .skip(Number(offset))
        .lean(); // Use lean() for better performance

      // Get total count for pagination
      const totalCount = await Purchase.countDocuments(filter);

      logger.info('Retrieved purchases', {
        count: purchases.length,
        totalCount,
        filter,
        assignmentUuid: ASSIGNMENT_UUID
      });

      // Return response
      res.json({
        purchases,
        pagination: {
          total: totalCount,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + purchases.length < totalCount
        },
        assignmentUuid: ASSIGNMENT_UUID
      });
    } catch (error) {
      logger.error('Error retrieving purchases', {
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

export { router as purchaseRouter };

