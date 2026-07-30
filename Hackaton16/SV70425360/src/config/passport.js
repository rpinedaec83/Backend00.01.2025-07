const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');
require('dotenv').config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return done(null, false);
    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const oauthId = profile.id;
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    const nombre = profile.displayName || 'Usuario';
    const provider = 'google';

    let [rows] = await pool.query('SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?', [provider, oauthId]);
    if (rows.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO users (oauth_provider, oauth_id, nombre, email) VALUES (?, ?, ?, ?)',
        [provider, oauthId, nombre, email]
      );
      const newUser = {
        id: result.insertId,
        oauth_provider: provider,
        oauth_id: oauthId,
        nombre,
        email
      };
      return done(null, newUser);
    } else {
      return done(null, rows[0]);
    }
  } catch (err) {
    done(err);
  }
}));

module.exports = passport;
