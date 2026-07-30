import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env, isProd } from './config/env.js';
import { buildSessionMiddleware } from './config/session.js';
import { sessionRouter } from './routes/authSession.routes.js';
import { jwtRouter } from './routes/authJwt.routes.js';
import { privateRouter } from './routes/private.routes.js';
import { csrfProtection, exposeCsrfToken } from './middleware/csrf.js';

export const app = express();

app.set('trust proxy', 1);

app.use(helmet());

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));

app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(express.json());
app.use(cookieParser());

app.use(buildSessionMiddleware());

const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MIN * 60 * 1000,
  max: env.RATE_LIMIT_MAX
});
app.use(generalLimiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.RATE_LIMIT_LOGIN_MAX,
  message: 'Too many login attempts, please try again later.'
});
app.use('/session/login', loginLimiter);
app.use('/jwt/login', loginLimiter);

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/csrf', csrfProtection, exposeCsrfToken);

app.use('/session', sessionRouter);
app.use('/jwt', jwtRouter);

app.use('/private', privateRouter);

app.post('/x-form', csrfProtection, (req, res) => {
  res.json({ ok: true, received: req.body });
});

app.use((req, res) => res.status(404).json({ error: 'not_found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'server_error' });
});
