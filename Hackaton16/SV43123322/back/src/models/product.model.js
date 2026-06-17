const pool = require('../config/db');

async function listActive() {
  const [rows] = await pool.execute(
    'SELECT id, category, name, description, price_cents FROM products WHERE active=1 ORDER BY category, id'
  );
  return rows;
}

async function getByIds(ids) {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT id, name, price_cents FROM products WHERE id IN (${placeholders})`,
    ids
  );
  return rows;
}

module.exports = { listActive, getByIds };