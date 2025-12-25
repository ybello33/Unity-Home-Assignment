/**
 * Kafka Consumer
 * 
 * Consumes purchase messages from Kafka and stores them in MongoDB
 * Assignment UUID: e271b052-9200-4502-b491-62f1649c07
 */

import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { Purchase, IPurchase } from '../models/Purchase';
import { logger } from '../utils/logger';

const ASSIGNMENT_UUID = 'e271b052-9200-4502-b491-62f1649c07';

// Kafka configuration from environment variables
const KAFKA_BROKERS = process.env.KAFKA_BROKERS?.split(',') || ['kafka-service:9092'];
const KAFKA_TOPIC = process.env.KAFKA_TOPIC || 'purchases';
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || 'customer-management-api-group';
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'customer-management-api';

// Create Kafka client
const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS,
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

// Create consumer
const consumer: Consumer = kafka.consumer({
  groupId: KAFKA_GROUP_ID,
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
  // Enable auto-commit for simplicity (in production, consider manual commits)
  allowAutoTopicCreation: false
});

/**
 * Setup and start Kafka consumer
 */
export async function setupKafkaConsumer(): Promise<void> {
  try {
    // Connect consumer
    await consumer.connect();
    logger.info('Kafka consumer connected', {
      brokers: KAFKA_BROKERS,
      groupId: KAFKA_GROUP_ID,
      assignmentUuid: ASSIGNMENT_UUID
    });

    // Subscribe to topic
    await consumer.subscribe({
      topic: KAFKA_TOPIC,
      fromBeginning: false // Start from latest messages
    });

    logger.info(`Subscribed to Kafka topic: ${KAFKA_TOPIC}`, {
      topic: KAFKA_TOPIC,
      assignmentUuid: ASSIGNMENT_UUID
    });

    // Start consuming messages
    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          await processPurchaseMessage(payload);
        } catch (error) {
          logger.error('Error processing Kafka message', {
            error: error instanceof Error ? error.message : String(error),
            topic: payload.topic,
            partition: payload.partition,
            offset: payload.message.offset,
            assignmentUuid: ASSIGNMENT_UUID
          });
          // In production, you might want to send to a dead-letter queue
        }
      }
    });

    logger.info('Kafka consumer started successfully', {
      topic: KAFKA_TOPIC,
      assignmentUuid: ASSIGNMENT_UUID
    });
  } catch (error) {
    logger.error('Failed to setup Kafka consumer', {
      error: error instanceof Error ? error.message : String(error),
      brokers: KAFKA_BROKERS,
      topic: KAFKA_TOPIC,
      assignmentUuid: ASSIGNMENT_UUID
    });
    throw error;
  }
}

/**
 * Process a purchase message from Kafka
 */
async function processPurchaseMessage(payload: EachMessagePayload): Promise<void> {
  const { message, topic, partition, offset } = payload;

  // Parse message value
  if (!message.value) {
    logger.warn('Received empty message from Kafka', {
      topic,
      partition,
      offset: offset.toString(),
      assignmentUuid: ASSIGNMENT_UUID
    });
    return;
  }

  try {
    const purchaseData = JSON.parse(message.value.toString());
    
    // Validate required fields
    if (!purchaseData.username || !purchaseData.userid || purchaseData.price === undefined) {
      logger.warn('Invalid purchase message format', {
        data: purchaseData,
        topic,
        partition,
        offset: offset.toString(),
        assignmentUuid: ASSIGNMENT_UUID
      });
      return;
    }

    // Create purchase document
    const purchase = new Purchase({
      username: purchaseData.username,
      userid: purchaseData.userid,
      price: parseFloat(purchaseData.price),
      timestamp: purchaseData.timestamp ? new Date(purchaseData.timestamp) : new Date()
    });

    // Save to MongoDB
    await purchase.save();

    logger.info('Purchase saved to MongoDB from Kafka', {
      purchaseId: purchase._id,
      userid: purchase.userid,
      username: purchase.username,
      price: purchase.price,
      topic,
      partition,
      offset: offset.toString(),
      assignmentUuid: ASSIGNMENT_UUID
    });
  } catch (error) {
    logger.error('Error processing purchase message', {
      error: error instanceof Error ? error.message : String(error),
      topic,
      partition,
      offset: offset.toString(),
      assignmentUuid: ASSIGNMENT_UUID
    });
    throw error;
  }
}

/**
 * Gracefully disconnect Kafka consumer
 */
export async function disconnectConsumer(): Promise<void> {
  try {
    await consumer.disconnect();
    logger.info('Kafka consumer disconnected', { assignmentUuid: ASSIGNMENT_UUID });
  } catch (error) {
    logger.error('Error disconnecting Kafka consumer', {
      error: error instanceof Error ? error.message : String(error),
      assignmentUuid: ASSIGNMENT_UUID
    });
  }
}

