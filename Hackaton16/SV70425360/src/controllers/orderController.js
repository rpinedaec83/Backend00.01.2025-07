const pool = require('../config/db');

// Para el hackathon, implementamos un SP simple o, si no existe, lo hacemos en JS.
async function createOrder(req, res) {
  const userId = req.user.id;
  const { items } = req.body; // [{ productId, cantidad }, ...]

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items requeridos' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Calcular total y crear order
    let total = 0;
    for (const item of items) {
      const [rows] = await connection.query('SELECT precio FROM products WHERE id = ?', [item.productId]);
      if (rows.length === 0) throw new Error('Producto no encontrado');
      const precio = rows[0].precio;
      total += precio * item.cantidad;
    }

    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total, estado) VALUES (?, ?, "pendiente")',
      [userId, total]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      const [rows] = await connection.query('SELECT precio FROM products WHERE id = ?', [item.productId]);
      const precio = rows[0].precio;
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.productId, item.cantidad, precio, precio * item.cantidad]
      );
    }

    await connection.commit();
    res.status(201).json({ orderId, total });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error al crear la orden' });
  } finally {
    connection.release();
  }
}

async function listOrders(req, res) {
  const userId = req.user.id;
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE user_id = ?', [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al listar órdenes' });
  }
}

async function getOrderById(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, userId]);
    if (orders.length === 0) return res.status(404).json({ message: 'Orden no encontrada' });
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    res.json({ order: orders[0], items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener la orden' });
  }
}

module.exports = {
  createOrder,
  listOrders,
  getOrderById
};
