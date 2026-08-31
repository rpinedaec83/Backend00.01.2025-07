import express from 'express';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', ensureAuthenticated, async (req, res) => {
  res.json({ message: `Pagos del usuario: ${req.user.email}` });
});

export default router;


