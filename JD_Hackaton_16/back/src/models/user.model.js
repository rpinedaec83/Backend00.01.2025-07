const pool = require('../config/db');

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, google_id, email, name FROM users WHERE id=?',
    [id]
  );
  return rows[0] || null;
}

module.exports = { findById };