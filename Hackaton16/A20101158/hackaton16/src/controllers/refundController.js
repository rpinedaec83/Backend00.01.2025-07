import { getRefundsByUser } from '../models/refunds.js';

export const listUserRefunds = async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'No autenticado' });

  try {
    const refunds = await getRefundsByUser(user.id);
    res.json(refunds);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar reembolsos' });
  }
};
