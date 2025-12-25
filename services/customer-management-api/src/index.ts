/**
 * Customer Management API
 * 
 * This service:
 * 1. Reads & Writes data into MongoDB
 * 2. Consumes messages from Kafka
 * 3. Provides GET route to return all customer purchases
 * 
 * Assignment UUID: e271b052-9200-4502-b491-62f1649c07
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectToMongoDB } from './config/mongodb';
import { setupKafkaConsumer } from './kafka/consumer';
import { purchaseRouter } from './routes/purchases';
import { healthRouter } from './routes/health';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

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
app.use('/api/purchases', purchaseRouter);
app.use('/health', healthRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Customer Management API',
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
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...', { assignmentUuid: ASSIGNMENT_UUID });
    await connectToMongoDB();
    logger.info('MongoDB connected successfully', { assignmentUuid: ASSIGNMENT_UUID });

    // Setup Kafka consumer
    logger.info('Setting up Kafka consumer...', { assignmentUuid: ASSIGNMENT_UUID });
    await setupKafkaConsumer();
    logger.info('Kafka consumer started successfully', { assignmentUuid: ASSIGNMENT_UUID });

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`Customer Management API server running on port ${PORT}`, {
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

