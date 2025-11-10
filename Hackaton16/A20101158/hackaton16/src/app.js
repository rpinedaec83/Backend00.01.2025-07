import express from 'express';
import session from 'express-session';
import passport from 'passport';
import './config/passport.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import pool from './db/connection.js';
import paymentsSocket from './sockets/paymentsSocket.js';

// Rutas
import authRoutes, { ensureAuthenticated } from './routes/auth.js';
import productRoutes from './routes/products.js';
import paymentRoutes from './routes/payments.js';
import refundRoutes from './routes/refunds.js';

dotenv.config();

// Configuración inicial
const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

// Directorio base
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión (necesaria para Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    },
  })
);

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Carpeta pública
app.use(express.static(path.join(__dirname, 'views')));

// Estrategia de Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const [rows] = await pool.query('SELECT * FROM users WHERE oauth_id = ?', [profile.id]);


        if (rows.length === 0) {
          await pool.query(
            'INSERT INTO users (oauth_id, name, email, provider) VALUES (?, ?, ?, ?)',
            [profile.id, profile.displayName, profile.emails[0].value, profile.provider]
          );

        }

        return done(null, profile);
      } catch (err) {
        console.error('Error en GoogleStrategy:', err);
        return done(err, null);
      }
    }
  )
);

// Serialización de usuario para la sesión
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Rutas principales
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/payments', paymentRoutes);
app.use('/refunds', refundRoutes);

// Página principal pública
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Ruta protegida del Dashboard (solo usuarios autenticados)
app.get('/dashboard.html', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Iniciar Socket.io (para pagos en tiempo real)
paymentsSocket(io);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
