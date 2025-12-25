/**
 * Health Check Route
 * 
 * Provides health check endpoint for Kubernetes liveness/readiness probes
 * Assignment UUID: e271b052-9200-4502-b491-62f1649c07
 */

import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { getProducer } from '../kafka/producer';

const ASSIGNMENT_UUID = 'e271b052-9200-4502-b491-62f1649c07';
const router = Router();

/**
 * GET /health
 * 
 * Health check endpoint
 * Returns 200 if service is healthy, 503 if unhealthy
 */
router.get('/', async (req: Request, res: Response) => {
  try {
      // Check Kafka producer connection
      const producer = getProducer();
      const producer = getProducer();
      const isKafkaConnected = producer !== null;

    const health = {
      status: isKafkaConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        kafka: {
          status: isKafkaConnected ? 'connected' : 'disconnected'
        }
      },
      assignmentUuid: ASSIGNMENT_UUID
    };

    if (isKafkaConnected) {
      res.status(200).json(health);
    } else {
      res.status(503).json(health);
    }
  } catch (error) {
    logger.error('Health check failed', {
      error: error instanceof Error ? error.message : String(error),
      assignmentUuid: ASSIGNMENT_UUID
    });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      assignmentUuid: ASSIGNMENT_UUID
    });
  }
});

/**
 * GET /health/live
 * 
 * Liveness probe endpoint
 * Always returns 200 if the process is running
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    assignmentUuid: ASSIGNMENT_UUID
  });
});

/**
 * GET /health/ready
 * 
 * Readiness probe endpoint
 * Returns 200 if service is ready to accept traffic
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const isKafkaConnected = producer !== null;

    if (isKafkaConnected) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        assignmentUuid: ASSIGNMENT_UUID
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        assignmentUuid: ASSIGNMENT_UUID
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      assignmentUuid: ASSIGNMENT_UUID
    });
  }
});

export { router as healthRouter };

