const pool = require('../config/db');

async function createOrder(userId, items) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [resOrder] = await conn.execute(
      'INSERT INTO orders (user_id, status, total_cents) VALUES (?, "UNPAID", 0)',
      [userId]
    );
    const orderId = resOrder.insertId;
    let total = 0;
    for (const it of items) {
      total += it.unit_price_cents * it.quantity;
      await conn.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES (?,?,?,?)',
        [orderId, it.product_id, it.quantity, it.unit_price_cents]
      );
    }
    await conn.execute('UPDATE orders SET total_cents=? WHERE id=?', [total, orderId]);
    await conn.commit();
    return { id: orderId, total_cents: total };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function getOrder(orderId, userId) {
  const [o] = await pool.execute(
    'SELECT * FROM orders WHERE id=? AND user_id=?',
    [orderId, userId]
  );
  if (!o.length) return null;
  const [items] = await pool.execute(
    'SELECT product_id, quantity, unit_price_cents FROM order_items WHERE order_id=?',
    [orderId]
  );
  return { ...o[0], items };
}

async function setStripeSession(orderId, sessionId, paymentIntent) {
  await pool.execute(
    'UPDATE orders SET stripe_session_id=?, stripe_payment_intent=? WHERE id=?',
    [sessionId, paymentIntent || null, orderId]
  );
}

async function updateStatusBySession(sessionId, status) {
  await pool.execute(
    'UPDATE orders SET status=? WHERE stripe_session_id=?',
    [status, sessionId]
  );
}

async function updateStatusByPaymentIntent(paymentIntentId, status) {
  await pool.execute(
    'UPDATE orders SET status=? WHERE stripe_payment_intent=?',
    [status, paymentIntentId]
  );
}

module.exports = {
  createOrder,
  getOrder,
  setStripeSession,
  updateStatusBySession,
  updateStatusByPaymentIntent
};