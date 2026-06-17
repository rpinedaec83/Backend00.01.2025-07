const router = require('express').Router();
const pool = require('./src/config/db');

router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, category, name, description, price_cents FROM products WHERE active=1 ORDER BY category, id'
    );
    res.json({ products: rows });
  } catch (e) {
    next(e);
  }
});

module.exports = router;