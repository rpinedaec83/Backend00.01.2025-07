const pool = require('../config/db');

async function createReceipt(orderId, receiptNumber) {
  await pool.execute(
    'INSERT INTO receipts (order_id, receipt_number) VALUES (?,?)',
    [orderId, receiptNumber]
  );
}

module.exports = { createReceipt };