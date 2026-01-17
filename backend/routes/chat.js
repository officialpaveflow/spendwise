const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Send message to AI
router.post('/send', chatController.sendMessage);

// Get chat history
router.get('/history/:userId', chatController.getChatHistory);

module.exports = router;