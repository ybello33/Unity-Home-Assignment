/**
 * Kafka Producer
 * 
 * Publishes purchase messages to Kafka
 * Assignment UUID: e271b052-9200-4502-b491-62f1649c07
 */

import { Kafka, Producer } from 'kafkajs';
import { logger } from '../utils/logger';

const ASSIGNMENT_UUID = 'e271b052-9200-4502-b491-62f1649c07';

// Kafka configuration from environment variables
const KAFKA_BROKERS = process.env.KAFKA_BROKERS?.split(',') || ['kafka-service:9092'];
const KAFKA_TOPIC = process.env.KAFKA_TOPIC || 'purchases';
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'customer-facing-server';

// Create Kafka client
const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS,
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

// Create producer
let producer: Producer | null = null;

// Export producer for health checks
export function getProducer(): Producer | null {
  return producer;
}

/**
 * Setup and start Kafka producer
 */
export async function setupKafkaProducer(): Promise<void> {
  try {
    producer = kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true, // Enable idempotent producer for exactly-once semantics
      transactionTimeout: 30000
    });

    // Connect producer
    await producer.connect();
    logger.info('Kafka producer connected', {
      brokers: KAFKA_BROKERS,
      topic: KAFKA_TOPIC,
      assignmentUuid: ASSIGNMENT_UUID
    });
  } catch (error) {
    logger.error('Failed to setup Kafka producer', {
      error: error instanceof Error ? error.message : String(error),
      brokers: KAFKA_BROKERS,
      topic: KAFKA_TOPIC,
      assignmentUuid: ASSIGNMENT_UUID
    });
    throw error;
  }
}

/**
 * Publish a purchase message to Kafka
 * 
 * @param purchaseData Purchase data object with username, userid, price, timestamp
 * @returns Promise that resolves when message is sent
 */
export async function publishPurchase(purchaseData: {
  username: string;
  userid: string;
  price: number;
  timestamp: string | Date;
}): Promise<void> {
  if (!producer) {
    throw new Error('Kafka producer not initialized');
  }

  try {
    // Ensure timestamp is a string
    const timestamp = purchaseData.timestamp instanceof Date
      ? purchaseData.timestamp.toISOString()
      : purchaseData.timestamp;

    const message = {
      topic: KAFKA_TOPIC,
      messages: [
        {
          key: purchaseData.userid, // Use userid as key for partitioning
          value: JSON.stringify({
            username: purchaseData.username,
            userid: purchaseData.userid,
            price: purchaseData.price,
            timestamp: timestamp
          })
        }
      ]
    };

    // Send message to Kafka
    const result = await producer.send(message);

    logger.info('Purchase message published to Kafka', {
      userid: purchaseData.userid,
      username: purchaseData.username,
      price: purchaseData.price,
      topic: KAFKA_TOPIC,
      partition: result[0].partition,
      offset: result[0].offset,
      assignmentUuid: ASSIGNMENT_UUID
    });
  } catch (error) {
    logger.error('Failed to publish purchase message to Kafka', {
      error: error instanceof Error ? error.message : String(error),
      purchaseData,
      topic: KAFKA_TOPIC,
      assignmentUuid: ASSIGNMENT_UUID
    });
    throw error;
  }
}

/**
 * Gracefully disconnect Kafka producer
 */
export async function disconnectProducer(): Promise<void> {
  try {
    if (producer) {
      await producer.disconnect();
      producer = null;
      logger.info('Kafka producer disconnected', { assignmentUuid: ASSIGNMENT_UUID });
    }
  } catch (error) {
    logger.error('Error disconnecting Kafka producer', {
      error: error instanceof Error ? error.message : String(error),
      assignmentUuid: ASSIGNMENT_UUID
    });
  }
}

