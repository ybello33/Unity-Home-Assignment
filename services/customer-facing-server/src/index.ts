/**
 * Customer Facing Web Server
 * 
 * This service:
 * 1. Handles "buy" request and publishes the data object to Kafka (username, userid, price, timestamp)
 * 2. Handles "getAllUserBuys" and sends a GET request to Customer Management service
 * 
 * Assignment UUID: e271b052-9200-4502-b491-62f1649c07
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { setupKafkaProducer } from './kafka/producer';
import { buyRouter } from './routes/buy';
import { purchasesRouter } from './routes/purchases';
import { healthRouter } from './routes/health';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// Assignment UUID constant
const ASSIGNMENT_UUID = 'e271b052-9200-4502-b491-62f1649c07';

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    assignmentUuid: ASSIGNMENT_UUID
  });
  next();
});

// Routes
app.use('/api/buy', buyRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/health', healthRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Customer Facing Web Server',
    version: '1.0.0',
    assignmentUuid: ASSIGNMENT_UUID,
    status: 'running'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize services
async function startServer() {
  try {
    // Setup Kafka producer
    logger.info('Setting up Kafka producer...', { assignmentUuid: ASSIGNMENT_UUID });
    await setupKafkaProducer();
    logger.info('Kafka producer started successfully', { assignmentUuid: ASSIGNMENT_UUID });

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`Customer Facing Web Server running on port ${PORT}`, {
        port: PORT,
        assignmentUuid: ASSIGNMENT_UUID
      });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : String(error),
      assignmentUuid: ASSIGNMENT_UUID
    });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...', { assignmentUuid: ASSIGNMENT_UUID });
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...', { assignmentUuid: ASSIGNMENT_UUID });
  process.exit(0);
});

// Start the server
startServer();

