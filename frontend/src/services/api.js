/**
 * API Service
 * 
 * Handles all API calls to the Customer Facing Web Server
 * Assignment UUID: e271b052-9200-4502-b491-62f1649c07
 */

import axios from 'axios';

// API base URL from environment variable or default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

/**
 * Send a purchase request
 * 
 * @param {Object} purchaseData - Purchase data (username, userid, price)
 * @returns {Promise} API response
 */
export async function buyItem(purchaseData) {
  try {
    const response = await axios.post(`${API_URL}/api/buy`, purchaseData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.error || 'Purchase failed');
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Unable to connect to server. Please check if the service is running.');
    } else {
      // Error setting up request
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
}

/**
 * Get all purchases for a user
 * 
 * @param {string} userid - User ID to filter purchases
 * @returns {Promise} API response with purchases
 */
export async function getAllUserBuys(userid) {
  try {
    const response = await axios.get(`${API_URL}/api/purchases`, {
      params: {
        userid: userid
      },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.error || 'Failed to retrieve purchases');
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Unable to connect to server. Please check if the service is running.');
    } else {
      // Error setting up request
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
}

