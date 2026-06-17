const router = require('express').Router();
const auth = require('./src/middleware/authRequired');
const { buildAndCreateOrder, getOrder } = require('./src/services/order.service');

router.post('/create', auth, async (req, res, next) => {
  try {
    const cart = req.session.cart || [];
    if (!cart.length) return res.status(400).json({ error: 'Carrito vacío' });
    const order = await buildAndCreateOrder(req.user.id, cart);
    res.json({ order });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const order = await getOrder(Number(req.params.id), req.user.id);
    if (!order) return res.status(404).json({ error: 'No encontrado' });
    res.json({ order });
  } catch (e) {
    next(e);
  }
});

module.exports = router;