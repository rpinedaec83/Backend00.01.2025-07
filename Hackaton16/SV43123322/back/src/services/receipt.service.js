const { createReceipt } = require('../models/receipt.model');
const { generateReceiptNumber } = require('../utils/receiptNumber');

async function issueReceipt(orderId) {
  const receipt = generateReceiptNumber();
  await createReceipt(orderId, receipt);
  return receipt;
}

module.exports = { issueReceipt };