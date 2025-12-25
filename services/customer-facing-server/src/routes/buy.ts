/**
 * Buy Route
 * 
 * Handles purchase requests and publishes to Kafka
 * Assignment UUID: e271b052-9200-4502-b491-62f1649c07
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { publishPurchase } from '../kafka/producer';
import { logger } from '../utils/logger';

const ASSIGNMENT_UUID = 'e271b052-9200-4502-b491-62f1649c07';
const router = Router();

/**
 * POST /api/buy
 * 
 * Creates a purchase request and publishes it to Kafka
 * 
 * Request body:
 * {
 *   "username": "string",
 *   "userid": "string",
 *   "price": number
 * }
 */
router.post(
  '/',
  [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Username must be between 1 and 100 characters'),
    body('userid')
      .trim()
      .notEmpty()
      .withMessage('User ID is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('User ID must be between 1 and 100 characters'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a non-negative number')
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Invalid request data',
          details: errors.array(),
          assignmentUuid: ASSIGNMENT_UUID
        });
      }

      const { username, userid, price } = req.body;

      // Create purchase data with timestamp
      const purchaseData = {
        username: username.trim(),
        userid: userid.trim(),
        price: parseFloat(price),
        timestamp: new Date().toISOString()
      };

      // Publish to Kafka
      await publishPurchase(purchaseData);

      logger.info('Purchase request processed', {
        username: purchaseData.username,
        userid: purchaseData.userid,
        price: purchaseData.price,
        assignmentUuid: ASSIGNMENT_UUID
      });

      // Return success response
      res.status(201).json({
        message: 'Purchase request submitted successfully',
        purchase: purchaseData,
        assignmentUuid: ASSIGNMENT_UUID
      });
    } catch (error) {
      logger.error('Error processing purchase request', {
        error: error instanceof Error ? error.message : String(error),
        body: req.body,
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

export { router as buyRouter };

