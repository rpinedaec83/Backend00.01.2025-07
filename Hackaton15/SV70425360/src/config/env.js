import 'dotenv/config';

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),
  SESSION_SECRET: process.env.SESSION_SECRET ?? 'change-me',
  DB_HOST: process.env.DB_HOST ?? 'localhost',
  DB_PORT: Number(process.env.DB_PORT ?? 3306),
  DB_USER: process.env.DB_USER ?? 'root',
  DB_PASS: process.env.DB_PASS ?? '',
  DB_NAME: process.env.DB_NAME ?? 'courier_realtime',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173'
};

export const isProd = (env.NODE_ENV === 'production');
