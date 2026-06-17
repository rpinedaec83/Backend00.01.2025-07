require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('./src/config/passport');
const { ensureEnv } = require('./src/config/env');
const { FRONTEND_URL, SESSION_SECRET } = require('./src/config/env');

ensureEnv();

const app = express();

// Raw body SOLO para webhook Stripe antes de json()
app.use('/api/webhook/stripe', express.raw({ type: 'application/json' }));

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(express.json({ limit: '15kb' }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./auth.routes'));
app.use('/api/products', require('./product.routes'));
app.use('/api/cart', require('./cart.routes'));
app.use('/api/orders', require('./order.routes'));
app.use('/api/payments', require('./payment.routes'));
app.use('/api/webhook', require('./webhook.routes'));

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Error' });
});

const PORT = process.env.PORT || 8069;
app.listen(PORT, () => console.log('Backend escuchando en puerto', PORT));

module.exports = app;