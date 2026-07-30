import { Router } from 'express';
import { requireAuthSession } from '../middleware/authSession.js';
import { requireAuthJwt } from '../middleware/authJwt.js';
import { requireRole } from '../middleware/requireRole.js';

export const privateRouter = Router();

privateRouter.get('/profile', requireAuthSession, (req, res) => {
  res.json({ profile: { id: req.user.id, role: req.user.role, via: 'session' } });
});

privateRouter.get('/admin/stats', requireAuthJwt, requireRole('admin'), (req, res) => {
  res.json({ stats: { users: 2, uptime: process.uptime() } });
});
