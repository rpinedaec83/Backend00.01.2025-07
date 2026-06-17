const router = require('express').Router();
const passport = require('./src/config/passport');

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (_req, res) => {
    res.redirect(process.env.FRONTEND_URL + '/');
  }
);

router.post('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => res.json({ ok: true }));
  });
});

router.get('/me', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ user: null });
  }
  res.json({
    user: { id: req.user.id, name: req.user.name, email: req.user.email }
  });
});

module.exports = router;