const pool = require('../config/db');

async function list(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE estado = "activo"');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al listar productos' });
  }
}

async function create(req, res) {
  try {
    const { nombre, descripcion, precio, stock } = req.body;
    const [result] = await pool.query(
      'INSERT INTO products (nombre, descripcion, precio, stock, estado) VALUES (?, ?, ?, ?, "activo")',
      [nombre, descripcion, precio, stock]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear producto' });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, estado } = req.body;
    await pool.query(
      'UPDATE products SET nombre = ?, descripcion = ?, precio = ?, stock = ?, estado = ? WHERE id = ?',
      [nombre, descripcion, precio, stock, estado, id]
    );
    res.json({ message: 'Producto actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
}

module.exports = {
  list,
  create,
  update,
  remove
};
