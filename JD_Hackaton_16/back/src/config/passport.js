const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');
require('dotenv').config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, google_id, email, name FROM users WHERE id=?',
      [id]
    );
    done(null, rows[0] || false);
  } catch (e) {
    done(e);
  }
});

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: 'http://localhost:8069/api/auth/google/callback'
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const googleId = profile.id;
      const email = profile.emails?.[0]?.value || '';
      const name = profile.displayName || '';

      const [found] = await pool.execute(
        'SELECT id, google_id, email, name FROM users WHERE google_id=?',
        [googleId]
      );
      if (found.length) {
        return done(null, found[0]);
      }

      const [resInsert] = await pool.execute(
        'INSERT INTO users (google_id, email, name) VALUES (?,?,?)',
        [googleId, email, name]
      );
      return done(null, { id: resInsert.insertId, google_id: googleId, email, name });
    } catch (e) {
      done(e);
    }
  }
));

module.exports = passport;