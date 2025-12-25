/**
 * Purchase Model
 * 
 * MongoDB schema for storing customer purchases
 * Assignment UUID: e271b052-9200-4502-b491-62f1649c07
 */

import mongoose, { Document, Schema } from 'mongoose';

const ASSIGNMENT_UUID = 'e271b052-9200-4502-b491-62f1649c07';

// Purchase interface
export interface IPurchase extends Document {
  username: string;
  userid: string;
  price: number;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Purchase schema definition
const PurchaseSchema = new Schema<IPurchase>(
  {
    username: {
      type: String,
      required: true,
      index: true, // Index for faster queries
      trim: true
    },
    userid: {
      type: String,
      required: true,
      index: true, // Index for faster queries
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0 // Ensure price is non-negative
    },
    timestamp: {
      type: Date,
      required: true,
      index: true, // Index for sorting by date
      default: Date.now
    }
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
    collection: 'purchases' // Explicit collection name
  }
);

// Compound index for efficient queries by userid and timestamp
PurchaseSchema.index({ userid: 1, timestamp: -1 });

// Create and export the model
export const Purchase = mongoose.model<IPurchase>('Purchase', PurchaseSchema);

