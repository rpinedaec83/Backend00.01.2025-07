import express from 'express';
import passport from 'passport';
import { logout } from '../controllers/authController.js';

const router = express.Router();

// Iniciar autenticación con Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback de Google (OAuth)
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    res.redirect('/dashboard.html');
  }
);

// Cerrar sesión
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

//Middleware para proteger rutas privadas
export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login.html');
}
// Obtener datos del usuario autenticado
router.get('/user', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    // Enviar información básica del usuario
    res.json({
      loggedIn: true,
      user: {
        id: req.user.id || req.user.oauth_id,
        name: req.user.name,
        email: req.user.email,
        provider: req.user.provider,
      },
    });
  } else {
    res.status(401).json({ loggedIn: false, message: 'No autenticado' });
  }
});
export default router;


