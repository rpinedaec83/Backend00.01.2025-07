import { getAllProducts, getProductById, createProduct } from '../models/products.js';

export const listProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar productos' });
  }
};

export const showProduct = async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

export const addProduct = async (req, res) => {
  const { name, price, stock } = req.body;
  try {
    const id = await createProduct(name, price, stock);
    res.json({ message: 'Producto creado', id });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};
