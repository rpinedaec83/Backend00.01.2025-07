import { Router } from 'express';
import { validateCredentials, findUserById } from '../services/user.service.js';
import { requireAuthSession } from '../middleware/authSession.js';

export const sessionRouter = Router();

sessionRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await validateCredentials(email, password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Session error' });
    req.session.user = { id: user.id, role: user.role, email: user.email };
    res.json({ ok: true });
  });
});

sessionRouter.post('/logout', requireAuthSession, (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Session destroy error' });
    res.clearCookie('sid');
    res.json({ ok: true });
  });
});

sessionRouter.get('/me', requireAuthSession, async (req, res) => {
  const u = await findUserById(req.user.id);
  res.json({ id: u.id, email: u.email, role: u.role });
});
