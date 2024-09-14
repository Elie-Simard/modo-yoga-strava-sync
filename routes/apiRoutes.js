const express = require('express');
const router = express.Router();
const { handleModoWebhook } = require('../controllers/modoWebhookHandler');

// Endpoint pour recevoir les notifications de webhook
// donc la route /webhook/modo est utilisée pour recevoir les notifications de webhook
router.post('/webhook/modo', handleModoWebhook);

module.exports = router;