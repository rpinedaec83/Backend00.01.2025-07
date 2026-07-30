import session from 'express-session';
import { env, isProd } from './env.js';

export function buildSessionMiddleware() {
  const store = undefined; // Reemplaza por Redis/Mongo store en producción
  return session({
    name: 'sid',
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: 1000 * 60 * 15
    },
    store
  });
}
