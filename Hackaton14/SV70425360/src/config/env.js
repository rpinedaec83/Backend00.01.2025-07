import 'dotenv/config';

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),
  SESSION_SECRET: process.env.SESSION_SECRET,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  ACCESS_TTL: process.env.ACCESS_TTL ?? '10m',
  REFRESH_TTL: process.env.REFRESH_TTL ?? '7d',
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  CSRF_SECRET: process.env.CSRF_SECRET ?? 'csrf-secret',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  RATE_LIMIT_WINDOW_MIN: Number(process.env.RATE_LIMIT_WINDOW_MIN ?? 15),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX ?? 100),
  RATE_LIMIT_LOGIN_MAX: Number(process.env.RATE_LIMIT_LOGIN_MAX ?? 10)
};

export const isProd = env.NODE_ENV === 'production';
