const { getByIds } = require('../models/product.model');
const { createOrder, getOrder, setStripeSession } = require('../models/order.model');

async function buildAndCreateOrder(userId, cart) {
  const ids = cart.map(c => c.product_id);
  const products = await getByIds(ids);
  const map = new Map(products.map(p => [p.id, p]));
  const items = cart.map(c => {
    const prod = map.get(c.product_id);
    if (!prod) throw new Error('Producto inválido');
    return {
      product_id: prod.id,
      quantity: c.quantity,
      unit_price_cents: prod.price_cents
    };
  });
  return await createOrder(userId, items);
}

module.exports = {
  buildAndCreateOrder,
  getOrder,
  setStripeSession
};