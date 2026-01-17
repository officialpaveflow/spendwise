const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Add transaction
router.post('/add', transactionController.addTransaction);

// Get user transactions
router.get('/user/:userId', transactionController.getTransactions);

// Delete transaction
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;