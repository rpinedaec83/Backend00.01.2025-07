const pool = require('../config/db');

async function recordPayment(orderId, amountCents, currency, status, intentId) {
  await pool.execute(
    'INSERT INTO payments (order_id, amount_cents, currency, status, stripe_payment_intent) VALUES (?,?,?,?,?)',
    [orderId, amountCents, currency, status, intentId]
  );
}

module.exports = { recordPayment };