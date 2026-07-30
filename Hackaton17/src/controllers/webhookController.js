const pool = require('../config/db');
const { emitPaymentStatus } = require('../config/socket');

async function handleStripeWebhook(req, res) {
  let event = req.body;

  try {
    const eventType = event.type;
    if (eventType === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      const metadata = paymentIntent.metadata || {};
      const orderId = metadata.orderId;
      const userId = metadata.userId;

      await pool.query(
        'UPDATE payments SET estado = "succeeded", raw_response = ? WHERE gateway = "stripe" AND gateway_payment_id = ?',
        [JSON.stringify(paymentIntent), paymentIntentId]
      );

      await pool.query(
        'UPDATE orders SET estado = "pagado" WHERE id = ?',
        [orderId]
      );

      emitPaymentStatus(userId, {
        orderId,
        status: 'succeeded',
        message: 'Pago confirmado por Stripe'
      });
    } else if (eventType === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      const metadata = paymentIntent.metadata || {};
      const orderId = metadata.orderId;
      const userId = metadata.userId;

      await pool.query(
        'UPDATE payments SET estado = "failed", raw_response = ? WHERE gateway = "stripe" AND gateway_payment_id = ?',
        [JSON.stringify(paymentIntent), paymentIntentId]
      );

      await pool.query(
        'UPDATE orders SET estado = "pendiente" WHERE id = ?',
        [orderId]
      );

      emitPaymentStatus(userId, {
        orderId,
        status: 'failed',
        message: 'Pago fallido en Stripe'
      });
    }

    await pool.query(
      'INSERT INTO webhook_logs (gateway, tipo_evento, payload, procesado) VALUES ("stripe", ?, ?, 1)',
      [event.type, JSON.stringify(event)]
    );

    res.json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error procesando webhook de Stripe' });
  }
}

async function handleCulqiWebhook(req, res) {
  try {
    const payload = req.body;

    await pool.query(
      'INSERT INTO webhook_logs (gateway, tipo_evento, payload, procesado) VALUES ("culqi", ?, ?, 0)',
      [payload.type || 'culqi_event', JSON.stringify(payload)]
    );

    res.json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error procesando webhook de Culqi' });
  }
}

module.exports = {
  handleStripeWebhook,
  handleCulqiWebhook
};
