import pool from '../db/connection.js';

export const createRefund = async (paymentId, reason, amount) => {
  const [result] = await pool.query(
    'INSERT INTO refunds (payment_id, reason, amount, date) VALUES (?, ?, ?, NOW())',
    [paymentId, reason, amount]
  );
  return result.insertId;
};

export const getRefundsByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT r.* FROM refunds r
     JOIN payments p ON r.payment_id = p.id
     WHERE p.user_id = ?`,
    [userId]
  );
  return rows;
};
