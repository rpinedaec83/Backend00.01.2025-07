function generateReceiptNumber() {
  const now = new Date();
  return 'B-' + now.getFullYear() + (now.getMonth()+1) + now.getDate() + '-' + Math.random().toString(36).substring(2,8).toUpperCase();
}
module.exports = { generateReceiptNumber };