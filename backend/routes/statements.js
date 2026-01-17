const express = require('express');
const router = express.Router();
const statementController = require('../controllers/statementController');

// Upload and analyze statement
router.post('/upload', statementController.uploadStatement);

// Get user statements
router.get('/user/:userId', statementController.getStatements);

module.exports = router;