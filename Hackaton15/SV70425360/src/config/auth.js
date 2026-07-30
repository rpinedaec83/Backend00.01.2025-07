import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import { User } from '../models/User.js';

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (e) { done(e); }
});

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
  passport.use(new GoogleStrategy({
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: env.GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const id = `google:${profile.id}`;
      let user = await User.findByPk(id);
      if (!user) {
        user = await User.create({
          id,
          provider: 'google',
          email: profile.emails?.[0]?.value ?? `${profile.id}@google.local`,
          name: profile.displayName ?? 'User',
          avatar: profile.photos?.[0]?.value ?? null,
          role: 'client'
        });
      }
      return done(null, user);
    } catch (e) {
      return done(e);
    }
  }));
}

export { passport };
