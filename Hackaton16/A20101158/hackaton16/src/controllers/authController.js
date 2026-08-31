import { findUserByGoogleId, createUser } from '../models/users.js';
import pool from '../db/connection.js';

export const googleCallback = async (profile) => {
  try {
    let user = await findUserByGoogleId(profile.id);
    if (!user) {
      const userId = await createUser(
        profile.id,
        profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
        profile.emails?.[0]?.value || null
      );
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
      user = rows[0];
    }
    return user;
  } catch (error) {
    console.error('Error en googleCallback:', error.message);
    throw error;
  }
};

/**
 * Cierra la sesión activa del usuario
 */
export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).send('Error al cerrar sesión');
    }

    // Destruir la sesión de Express
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al destruir sesión:', err);
        return res.status(500).send('Error al cerrar sesión');
      }

      // Limpiar la cookie de sesión
      res.clearCookie('connect.sid');

      // Redirigir al login
      res.redirect('/login.html');
    });
  });
};
