const router = require('express').Router();
const auth = require('./src/middleware/authRequired');
const { getOrder } = require('./src/services/order.service');
const { createCheckoutSession } = require('./src/services/payment.service');
const { FRONTEND_URL } = require('./src/config/env');

router.post('/checkout/:orderId', auth, async (req, res, next) => {
  try {
    const order = await getOrder(Number(req.params.orderId), req.user.id);
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    if (order.status !== 'UNPAID') return res.status(400).json({ error: 'Estado inválido' });

    const lineItems = order.items.map(i => ({
      quantity: i.quantity,
      price_data: {
        currency: 'pen',
        product_data: { name: 'Producto #' + i.product_id },
        unit_amount: i.unit_price_cents
      }
    }));

    const session = await createCheckoutSession(
      order,
      lineItems,
      `${FRONTEND_URL}/success`,
      `${FRONTEND_URL}/cancel`
    );

    res.json({ checkout_url: session.url, session_id: session.id });
  } catch (e) {
    next(e);
  }
});

module.exports = router;