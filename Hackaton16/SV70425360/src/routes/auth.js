const express = require('express');
const passport = require('passport');

const router = express.Router();

// Iniciar login con Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback de Google
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Podrías redirigir a tu frontend real
    res.send('<h1>Login correcto</h1><p>Ahora puedes cerrar esta ventana y volver a la app.</p>');
  }
);

// Usuario actual
router.get('/me', (req, res) => {
  res.json({ user: req.user || null });
});

// Logout
router.post('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.json({ message: 'Sesión cerrada' });
  });
});

module.exports = router;
