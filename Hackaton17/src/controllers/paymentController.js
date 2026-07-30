const pool = require('../config/db');
const Stripe = require('stripe');
const { emitPaymentStatus } = require('../config/socket');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20'
});

async function createStripePaymentIntent(req, res) {
  const userId = req.user.id;
  const { orderId } = req.params;

  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    const order = orders[0];
    if (order.estado !== 'pendiente') {
      return res.status(400).json({ message: 'La orden no está pendiente' });
    }

    const amountInCents = Math.round(Number(order.total) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'pen',
      metadata: {
        orderId: order.id,
        userId: userId
      }
    });

    const [paymentResult] = await pool.query(
      'INSERT INTO payments (order_id, gateway, gateway_payment_id, moneda, monto, estado, raw_response) VALUES (?, "stripe", ?, "PEN", ?, "pending", ?)',
      [order.id, paymentIntent.id, order.total, JSON.stringify(paymentIntent)]
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentResult.insertId,
      paymentIntentId: paymentIntent.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear PaymentIntent de Stripe' });
  }
}

async function createStripeRefund(req, res) {
  const userId = req.user.id;
  const { paymentId } = req.params;
  const { amount } = req.body; // opcional, en soles

  try {
    const [payments] = await pool.query(
      'SELECT p.*, o.user_id FROM payments p INNER JOIN orders o ON p.order_id = o.id WHERE p.id = ?',
      [paymentId]
    );
    if (payments.length === 0) return res.status(404).json({ message: 'Pago no encontrado' });
    const payment = payments[0];
    if (payment.user_id !== userId) {
      return res.status(403).json({ message: 'No autorizado para reembolsar este pago' });
    }
    if (payment.estado !== 'succeeded') {
      return res.status(400).json({ message: 'Solo se pueden reembolsar pagos exitosos' });
    }

    const refundData = {
      payment_intent: payment.gateway_payment_id
    };
    if (amount) {
      refundData.amount = Math.round(Number(amount) * 100);
    }

    const refund = await stripe.refunds.create(refundData);

    await pool.query(
      'INSERT INTO refunds (payment_id, gateway_refund_id, monto, motivo, estado) VALUES (?, ?, ?, ?, ?)',
      [payment.id, refund.id, amount || payment.monto, 'Reembolso solicitado por el usuario', refund.status || 'succeeded']
    );

    await pool.query(
      'UPDATE payments SET estado = "refunded" WHERE id = ?',
      [payment.id]
    );

    await pool.query(
      'UPDATE orders SET estado = "refund_total" WHERE id = ?',
      [payment.order_id]
    );

    emitPaymentStatus(payment.user_id, {
      orderId: payment.order_id,
      paymentId: payment.id,
      status: 'refunded',
      message: 'Pago reembolsado mediante Stripe'
    });

    res.json({ message: 'Reembolso creado', refund });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear reembolso en Stripe' });
  }
}

module.exports = {
  createStripePaymentIntent,
  createStripeRefund
};
