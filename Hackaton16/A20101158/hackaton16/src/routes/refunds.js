import express from 'express';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', ensureAuthenticated, async (req, res) => {
  res.json({ message: `Reembolsos para ${req.user.name}` });
});

export default router;
