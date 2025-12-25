/**
 * MongoDB Configuration
 * 
 * Handles connection to MongoDB database
 * Assignment UUID: e271b052-9200-4502-b491-62f1649c07
 */

import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const ASSIGNMENT_UUID = 'e271b052-9200-4502-b491-62f1649c07';

// MongoDB connection URI from environment variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb-service:27017/purchases';

/**
 * Connect to MongoDB database
 */
export async function connectToMongoDB(): Promise<void> {
  try {
    const options = {
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      // Connection timeout
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(MONGODB_URI, options);

    logger.info('MongoDB connection established', {
      uri: MONGODB_URI.replace(/\/\/.*@/, '//***@'), // Mask credentials in logs
      assignmentUuid: ASSIGNMENT_UUID
    });

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error', {
        error: error.message,
        assignmentUuid: ASSIGNMENT_UUID
      });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected', { assignmentUuid: ASSIGNMENT_UUID });
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected', { assignmentUuid: ASSIGNMENT_UUID });
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB', {
      error: error instanceof Error ? error.message : String(error),
      uri: MONGODB_URI.replace(/\/\/.*@/, '//***@'),
      assignmentUuid: ASSIGNMENT_UUID
    });
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectFromMongoDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected', { assignmentUuid: ASSIGNMENT_UUID });
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', {
      error: error instanceof Error ? error.message : String(error),
      assignmentUuid: ASSIGNMENT_UUID
    });
  }
}

