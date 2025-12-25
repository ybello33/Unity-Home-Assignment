/**
 * Main App Component
 * 
 * Frontend UI with:
 * 1. Button 1 named "Buy" - Send a purchase request
 * 2. Button 2 named "getAllUserBuys" - display all purchase requests for the user
 * 
 * Assignment UUID: e271b052-9200-4502-b491-62f1649c07
 */

import React, { useState } from 'react';
import './App.css';
import { buyItem, getAllUserBuys } from './services/api';

const ASSIGNMENT_UUID = 'e271b052-9200-4502-b491-62f1649c07';

function App() {
  const [username, setUsername] = useState('');
  const [userid, setUserid] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState('');

  /**
   * Handle Buy button click
   * Sends a purchase request to the Customer Facing Web Server
   */
  const handleBuy = async () => {
    // Validate input
    if (!username.trim() || !userid.trim() || !price.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      setError('Price must be a valid non-negative number');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await buyItem({
        username: username.trim(),
        userid: userid.trim(),
        price: priceValue
      });

      setMessage(`Purchase successful! Purchase ID: ${result.purchase.userid}`);
      // Clear form after successful purchase
      setPrice('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to process purchase');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle getAllUserBuys button click
   * Retrieves all purchases for the current user
   */
  const handleGetAllUserBuys = async () => {
    if (!userid.trim()) {
      setError('Please enter a User ID');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    setPurchases([]);

    try {
      const result = await getAllUserBuys(userid.trim());
      setPurchases(result.purchases || []);
      setMessage(`Found ${result.purchases?.length || 0} purchase(s)`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to retrieve purchases');
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>Customer Purchase System</h1>
          <p className="subtitle">DevOps Assignment - UUID: {ASSIGNMENT_UUID}</p>
        </header>

        <div className="content">
          {/* Input Form */}
          <div className="form-section">
            <h2>User Information</h2>
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="userid">User ID:</label>
              <input
                id="userid"
                type="text"
                value={userid}
                onChange={(e) => setUserid(e.target.value)}
                placeholder="Enter user ID"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price:</label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                min="0"
                step="0.01"
                disabled={loading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="button-section">
            <button
              className="btn btn-buy"
              onClick={handleBuy}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Buy'}
            </button>
            <button
              className="btn btn-get"
              onClick={handleGetAllUserBuys}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'getAllUserBuys'}
            </button>
          </div>

          {/* Messages */}
          {message && (
            <div className="message message-success">
              {message}
            </div>
          )}
          {error && (
            <div className="message message-error">
              {error}
            </div>
          )}

          {/* Purchases List */}
          {purchases.length > 0 && (
            <div className="purchases-section">
              <h2>Purchase History</h2>
              <div className="purchases-list">
                {purchases.map((purchase, index) => (
                  <div key={purchase._id || index} className="purchase-item">
                    <div className="purchase-header">
                      <span className="purchase-id">ID: {purchase._id}</span>
                      <span className="purchase-date">
                        {new Date(purchase.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="purchase-details">
                      <p><strong>Username:</strong> {purchase.username}</p>
                      <p><strong>User ID:</strong> {purchase.userid}</p>
                      <p><strong>Price:</strong> ${purchase.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

