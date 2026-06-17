const router = require('express').Router();
const auth = require('./src/middleware/authRequired');

router.get('/', auth, (req, res) => {
  req.session.cart = req.session.cart || [];
  res.json({ cart: req.session.cart });
});

router.post('/add', auth, (req, res) => {
  const pid = Number(req.body.product_id);
  const qty = Number(req.body.quantity);
  if (!Number.isInteger(pid) || !Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  req.session.cart = req.session.cart || [];
  const existing = req.session.cart.find(i => i.product_id === pid);
  if (existing) existing.quantity += qty;
  else req.session.cart.push({ product_id: pid, quantity: qty });
  res.json({ cart: req.session.cart });
});

router.post('/remove', auth, (req, res) => {
  const pid = Number(req.body.product_id);
  req.session.cart = (req.session.cart || []).filter(i => i.product_id !== pid);
  res.json({ cart: req.session.cart });
});

router.post('/clear', auth, (_req, res) => {
  _req.session.cart = [];
  res.json({ cart: [] });
});

module.exports = router;