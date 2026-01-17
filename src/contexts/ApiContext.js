// src/contexts/ApiContext.js
import { createContext, useContext, useState } from 'react';

const API_URL = 'http://localhost:5000/api';

const ApiContext = createContext({});

export const useApi = () => useContext(ApiContext);

export function ApiProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function for API calls
  const apiCall = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Transaction API calls
  const addTransaction = async (transactionData) => {
    return apiCall('/transactions/add', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  };

  const getTransactions = async (userId) => {
    return apiCall(`/transactions/user/${userId}`);
  };

  const deleteTransaction = async (transactionId, userId) => {
    return apiCall(`/transactions/${transactionId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  };

  // Chat API calls
  const sendChatMessage = async (userId, message) => {
    return apiCall('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ userId, message }),
    });
  };

  const getChatHistory = async (userId) => {
    return apiCall(`/chat/history/${userId}`);
  };

  // Statement API calls
  const uploadStatement = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/statements/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Upload Error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getStatements = async (userId) => {
    return apiCall(`/statements/user/${userId}`);
  };

  const clearError = () => setError(null);

  const value = {
    loading,
    error,
    clearError,
    addTransaction,
    getTransactions,
    deleteTransaction,
    sendChatMessage,
    getChatHistory,
    uploadStatement,
    getStatements,
  };

  return React.createElement(ApiContext.Provider, { value }, children);
}