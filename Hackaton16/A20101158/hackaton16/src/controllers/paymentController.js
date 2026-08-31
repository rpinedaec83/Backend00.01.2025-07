import {
  createPayment,
  getPaymentsByUser,
  updatePaymentStatus,
} from '../models/payments.js';
import { getProductById } from '../models/products.js';
import { createRefund } from '../models/refunds.js';

export const makePayment = async (req, res) => {
  const { productId, amount } = req.body;
  const user = req.user;

  if (!user) return res.status(401).json({ error: 'No autenticado' });

  try {
    const product = await getProductById(productId);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    const paymentId = await createPayment(user.id, productId, amount);
    res.json({ message: 'Pago realizado', paymentId });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar pago' });
  }
};

export const listUserPayments = async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'No autenticado' });

  try {
    const payments = await getPaymentsByUser(user.id);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
};

export const refundPayment = async (req, res) => {
  const { paymentId, reason } = req.body;

  try {
    await updatePaymentStatus(paymentId, 'refunded');
    const [payment] = await getPaymentsByUser(paymentId);
    await createRefund(paymentId, reason, payment.amount);

    res.json({ message: 'Reembolso procesado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar reembolso' });
  }
};
