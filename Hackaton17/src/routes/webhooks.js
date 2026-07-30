const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Stripe webhook (ejemplo simple, sin firma para hackathon)
router.post('/stripe', express.raw({ type: 'application/json' }), webhookController.handleStripeWebhook);

// Culqi webhook (borrador)
router.post('/culqi', express.json(), webhookController.handleCulqiWebhook);

module.exports = router;
