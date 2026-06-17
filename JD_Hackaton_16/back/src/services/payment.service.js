const stripe = require('../config/stripe');
const { setStripeSession } = require('./../models/order.model');

async function createCheckoutSession(order, lineItems, successUrl, cancelUrl) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: { order_id: order.id }
  });
  await setStripeSession(order.id, session.id, session.payment_intent || null);
  return session;
}

module.exports = { createCheckoutSession };