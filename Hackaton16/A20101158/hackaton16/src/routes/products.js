import express from 'express';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/', ensureAuthenticated, async (req, res) => {
  res.json({ message: `Bienvenido ${req.user.name}, estos son tus productos.` });
});

export default router;
