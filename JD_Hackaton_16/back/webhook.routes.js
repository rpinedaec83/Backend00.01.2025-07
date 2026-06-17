const router = require('express').Router();
const stripe = require('./src/config/stripe');
const { STRIPE_WEBHOOK_SECRET } = require('./src/config/env');
const { updateStatusBySession, updateStatusByPaymentIntent } = require('./src/models/order.model');
const { recordPayment } = require('./src/models/payment.model');
const { issueReceipt } = require('./src/services/receipt.service');

router.post('/stripe', async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await updateStatusBySession(session.id, 'PAID');
      if (session.payment_intent && session.metadata?.order_id) {
        const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
        await recordPayment(
          parseInt(session.metadata.order_id, 10),
          pi.amount_received,
          pi.currency,
          'succeeded',
          pi.id
        );
        await issueReceipt(parseInt(session.metadata.order_id, 10));
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      if (intent.metadata?.order_id) {
        await updateStatusByPaymentIntent(intent.id, 'FAILED');
        await recordPayment(
          parseInt(intent.metadata.order_id, 10),
          intent.amount || 0,
            intent.currency || 'pen',
          'failed',
          intent.id
        );
      }
    }

    res.json({ received: true });
  } catch (e) {
    console.error('Webhook handling error:', e);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;