require('dotenv').config();


const normalized = {
  SESSION_SECRET: process.env.SESSION_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL,

  MYSQLHOST: process.env.MYSQLHOST,
  MYSQLUSER: process.env.MYSQLUSER,
  MYSQLPASS: process.env.MYSQLPASS,
  MYSQLBBDD: process.env.MYSQLBBDD,
  MYSQLPORT: process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : 3306,


  STRIPE_SECRET_KEY:
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET ||
    process.env.SKSTRIPE ||
    process.env.STRIPE_SK,

  STRIPE_WEBHOOK_SECRET:
    process.env.STRIPE_WEBHOOK_SECRET ||
    process.env.WEBHOOK_SECRET ||
    process.env.STRIPE_WHSEC ||
    process.env.WHSTRIPE,


  PKSTRIPE:
    process.env.PKSTRIPE ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    process.env.PK_STRIPE ||
    ''
};

const REQUIRED = [
  'SESSION_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'FRONTEND_URL',
  'MYSQLHOST',
  'MYSQLUSER',
  'MYSQLPASS',
  'MYSQLBBDD',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET'
];

function ensureEnv() {
  const missing = REQUIRED.filter(k => !normalized[k]);
  if (missing.length) {
    console.error('Variables faltantes:', missing);
    process.exit(1);
  }
}

module.exports = {
  ensureEnv,
  ...normalized
};