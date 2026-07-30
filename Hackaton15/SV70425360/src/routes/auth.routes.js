import { Router } from 'express';
import { passport } from '../config/auth.js';

export const authRouter = Router();

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

authRouter.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (req, res) => {
    res.redirect('/');
  }
);

authRouter.post('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

authRouter.get('/me', (req, res) => {
  if (!req.user) return res.status(200).json({ user: null });
  const { id, email, name, avatar, role } = req.user;
  res.json({ user: { id, email, name, avatar, role } });
});
