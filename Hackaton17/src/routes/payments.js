const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/paymentController');

router.post('/order/:orderId/pay', isAuthenticated, paymentController.createStripePaymentIntent);
router.post('/payments/:paymentId/refund', isAuthenticated, paymentController.createStripeRefund);

module.exports = router;
